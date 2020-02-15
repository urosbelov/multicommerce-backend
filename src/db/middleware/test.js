const jwt = require("jsonwebtoken");
const Store = require("../models/store");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const token = req.cookies.access_token;

  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res
      .status(401)
      .send("Access denied!")
      .end();
  }

  try {
    payload = jwt.verify(token, "uros");
    decoded = jwt.decode(token);
    id = Object.values(decoded)[0];
    role = Object.values(decoded)[1];
    let user;

    if (role === "store") {
      user = await Store.findOne({ _id: id });
    } else if (role === "user") {
      user = await User.findOne({ _id: id });
    } else if (role === "admin") {
      console.log("admin");
    }

    req.user = user;
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .send("Access denied!")
        .end();
    }

    return res.status(400).end();
  }
  next();
};
