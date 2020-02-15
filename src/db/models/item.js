const mongoose = require("mongoose");
const shortid = require("shortid");

const itemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  price: {
    type: Number
  },
  category: [String],
  discount: {
    type: Number
  },
  status: {
    type: Boolean,
    default: true
  },
  img: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Stores"
  }
});

const Item = mongoose.model("Items", itemSchema);

module.exports = Item;
