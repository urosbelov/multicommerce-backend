const jwt = require("jsonwebtoken");

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
