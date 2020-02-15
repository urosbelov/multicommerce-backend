//CORE IMPORT
require("dotenv").config();
const express = require("express");
const Mongoose = require("./db/mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./auth/passport")(passport);

///ROUTES IMPORT
const usersRouter = require("./routers/users");
const storesRouter = require("./routers/stores");
const itemsRouter = require("./routers/items");
const messagesRouter = require("./routers/messages");
const ordersRouter = require("./routers/orders");

///APPS IMPORT
const io = require("./messages/socket").initialize(process.env.SOCKET_PORT);
const Consumer = require("./messages/socketConsumer");

const { PORT } = process.env;

//CORE
const app = express();
app.use(cookieParser());
app.use(express.json());

////DEV
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
  })
);

//APPS START
Mongoose.start();
Consumer.start(io);

//SERVER ROUTES
app.use(usersRouter);
app.use(storesRouter);
app.use(itemsRouter);
app.use(messagesRouter);
app.use(ordersRouter);

app.listen(PORT, err => {
  if (err) throw err;
  console.log(`Backend server is ready on port ${PORT}.`);
});
