const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  CLOUDAMQP_URL: process.env.CLOUDAMQP_URL,
  TOKEN_NAME: process.env.TOKEN_NAME,
  TOKEN_SECRET: process.env.TOKEN_SECRET
};
