const jwt = require("jsonwebtoken");

function checkRole(cookie) {
  decoded = jwt.decode(cookie);
  role = Object.values(decoded)[1];

  return role;
}

module.exports = { checkRole };
