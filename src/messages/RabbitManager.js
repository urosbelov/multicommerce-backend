const Rabbit = require("./rabbit");
const ClientManager = require("./ClientManager");

const publish = (message, consumer, publisher, connection) => {
  const clientId = ClientManager.getClientById(consumer);
  const opts = {
    headers: {
      publisher: publisher,
      consumer: consumer,
      connection: connection
    },
    timestamp: Date.now()
  };
  Rabbit.publish("", clientId, new Buffer.from(message), opts);
};
module.exports = { publish };
