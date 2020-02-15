const mongoose = require("mongoose");
const Order = require("./order");

const messageSchema = new mongoose.Schema({
  publisher: { type: mongoose.Schema.Types.ObjectId },
  message: String,
  timestamp: Date
});

const connectionSchema = new mongoose.Schema({
  authors: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  messages: [messageSchema],
  orders: [
    {
      type: String,
      ref: "Orders"
    }
  ]
});

const Message = mongoose.model("Message", messageSchema);
const Connection = mongoose.model("Connection", connectionSchema);

module.exports = { Message, Connection };
