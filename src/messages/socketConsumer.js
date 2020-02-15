const Rabbit = require("./rabbit");
const ClientManager = require("./ClientManager");
const ConnectionManager = require("./ConnectionManager");
const RabbitManager = require("./RabbitManager");

module.exports = {
  start: io => {
    io.on("connection", client => {
      console.log("New Socket Connection: ", client.id);
      ///REGISTER NEW CLIENT
      client.on("register", userId => {
        ClientManager.registerClient(client.id, userId);
        console.log(
          "[WebSocket] Socket New Client registered, starting AMQP: ",
          client.id
        );
        Rabbit.start(client.id);
        io.emit("users", [...ClientManager.getAllClients(client.id)]);
      });

      ///MESSAGE PASSED TO RABBITMQ
      client.on("sendMessage", message => {
        console.log("SOCKET MESSAGE: ", message);
        //FIND CONNECTION/CREATE NEW
        if (!message.connection) {
          const publisher = ClientManager.getClientBySocket(client.id);
          ConnectionManager.createConnection(
            message.consumer,
            publisher,
            id => {
              RabbitManager.publish(
                message.message,
                message.consumer,
                publisher,
                id
              );
            }
          );
        } else {
          //PUBLISH TO RABBITMQ
          return RabbitManager.publish(
            message.message,
            message.consumer,
            message.publisher,
            message.connection
          );
        }
      });

      ///DISCONNECT
      client.on("disconnect", () => {
        if (ClientManager.clientExist(client.id)) {
          ClientManager.removeClient(client.id);
          Rabbit.closeConnection();
          io.emit("users", [...ClientManager.getAllClients(client.id)]);
        }
      });
    });
  }
};
