const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String
  },

  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  birthday: {
    type: Date
  },
  agreement: {
    type: Boolean
  },
  connections: {
    type: Array
  },
  role: {
    type: String,
    default: "user"
  }
});

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.TOKEN_SECRET
  );

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("User not found!");
  }

  if (password !== user.password) {
    throw new Error("Password error!");
  }

  return user;
};

const User = mongoose.model("Users", userSchema);

module.exports = User;
