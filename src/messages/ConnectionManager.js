const { Message, Connection } = require("../db/models/messages");
const io = require("./socket").io();

const createConnection = async (consumer, publisher, callback) => {
  let id;
  const connection = new Connection({
    authors: [consumer, publisher]
  });

  await connection
    .save()
    .then(newConnection => {
      io.to(clientId).emit("newConnection", newConnection);
      id = newConnection._id.toString();
    })
    .catch(err => {
      console.log("Creating connection error: ", err);
    });

  callback(id);
};

const preserveMessage = async (publisher, message, timestamp, connection) => {
  const preservedMessage = new Message({
    publisher: publisher,
    message: message,
    timestamp: timestamp
  });

  Connection.findById(connection, async (err, connection) => {
    connection.messages.push(preservedMessage);
    await connection.save().then(connection => {});
  });

  return preservedMessage;
};

module.exports = {
  createConnection,
  preserveMessage
};
