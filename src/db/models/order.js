const mongoose = require("mongoose");
const shortid = require("shortid");
const Item = require("./item");

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stores"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  items: [
    {
      type: String,
      ref: "Items"
    }
  ]
});

const Order = mongoose.model("Orders", orderSchema);

module.exports = Order;
