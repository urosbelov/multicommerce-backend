const amqp = require("amqplib/callback_api");
const ClientManager = require("./ClientManager");
const ConnectionManager = require("./ConnectionManager");
const io = require("./socket").io();

var amqpConn = null;
function start(clientId) {
  amqp.connect(process.env.CLOUDAMQP_URL + "?heartbeat=60", function(
    err,
    conn
  ) {
    if (err) {
      console.error("[AMQP] error: ", err.message);
      console.log("[AMQP] reconnecting...");
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] connection error: ", err.message);
      }
    });
    conn.on("close", function() {
      if (ClientManager.clientExist(clientId)) {
        console.error("[AMQP] reconnecting...");
        return setTimeout(start, 1000);
      }
      return console.log(
        "[AMQP] connections is closed, client is not online..."
      );
    });

    console.log("[AMQP] connected...");
    amqpConn = conn;

    whenConnected(clientId);
  });
}

function whenConnected(clientId) {
  startPublisher();
  startWorker(clientId);
}

var pubChannel = null;
var offlinePubQueue = [];
function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] Publish channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] Publish channel closed...");
    });

    pubChannel = ch;
    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content, opts) {
  try {
    pubChannel.publish(
      exchange,
      routingKey,
      content,
      { ...opts, persistent: true },
      function(err, ok) {
        if (err) {
          console.error("[AMQP] publish", err);
          offlinePubQueue.push([exchange, routingKey, content]);
          pubChannel.connection.close();
        }
      }
    );
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

// A worker that acks messages only if processed succesfully
function startWorker(clientId) {
  amqpConn.createChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] Consumer channel error", err);
    });
    ch.on("close", (err, ok) => {
      if (err) {
        console.log("[AMQP] Consumer channel error on close: ", err);
      }
      console.log("[AMQP] Consumer channel closing, deleting queue...");
    });

    ch.prefetch(10);
    console.log("[AMQP] Asserting Queue: ", clientId);
    ch.assertQueue(clientId, { durable: false, autoDelete: true }, function(
      err,
      _ok
    ) {
      if (closeOnErr(err)) return;
      ch.consume(clientId, processMsg, { noAck: false });
      console.log("[AMQP] Worker is started, consuming: ", clientId, " queue.");
    });

    function processMsg(msg) {
      work(msg, function(ok) {
        try {
          if (ok) ch.ack(msg);
          else ch.reject(msg, true);
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  });
}

async function work(msg, cb) {
  const clientId = ClientManager.getClientById(msg.properties.headers.consumer);
  const { publisher, connection } = msg.properties.headers;
  const timestamp = msg.properties.timestamp;
  const message = msg.content.toString();
  const payload = await ConnectionManager.preserveMessage(
    publisher,
    message,
    timestamp,
    connection
  );

  console.log("Rabbit Message: ", payload);
  io.to(clientId).emit("recieve", payload);
  cb(true);
}

function closeConnection() {
  amqpConn.close();
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

module.exports = {
  start,
  publish,
  closeConnection
};
