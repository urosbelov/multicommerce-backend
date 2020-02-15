const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const storeSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "store"
  }
});

storeSchema.virtual("items", {
  ref: "Items",
  localField: "_id",
  foreignField: "owner"
});

storeSchema.methods.generateAuthToken = async function() {
  const store = this;
  const token = jwt.sign(
    { _id: store._id.toString(), role: store.role },
    process.env.TOKEN_SECRET
  );

  return token;
};

storeSchema.statics.findByCredentials = async (email, password) => {
  const store = await Store.findOne({ email });

  if (!store) {
    throw new Error("Store not found!");
  }

  if (password !== store.password) {
    throw new Error("Password error!");
  }

  return store;
};

const Store = mongoose.model("Stores", storeSchema);

module.exports = Store;
