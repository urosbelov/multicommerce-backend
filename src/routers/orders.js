const express = require("express");
const router = new express.Router();
const passport = require("passport");
const AccessControl = require("accesscontrol");
const grants = require("../../grants");
const Order = require("../db/models/order");
const { Connection } = require("../db/models/messages");
const chalk = require("chalk");
const ac = new AccessControl(grants);

////////////////////// CREATE ORDER
router.post(
  "/api/v1/orders",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const permission = ac.can(req.user.role).createOwn("orders");
    if (permission.granted) {
      const { orders } = req.body;
      console.log(chalk.blue("Orders Router (Recieved): "), orders.length);
      orders.forEach(order => {
        const connection = new Connection({
          authors: [req.user._id, order.store._id],
          orders: []
        });
        let newOrder = { store: null, user: req.user._id, items: [] };
        newOrder.store = order.store._id;
        order.products.forEach(product => {
          newOrder.items.push(product._id);
          const preserveOrder = new Order(newOrder);
          try {
            preserveOrder.save().then(saved => {
              connection.orders.push(saved._id);
              connection.save().then(connection => {
                console.log(
                  chalk.blue("Orders Router (New connection): "),
                  connection
                );
              });
              console.log(chalk.blue("Order Saved: "), saved);
            });
          } catch (e) {
            res.status(400).send(e);
          }
        });
        newOrder.items = [];
      });
      res.status(201).send("Order is created.");
    } else {
      res.status(403).send("Access denied!");
    }
  }
);

////////////////////// GET ITEMS
router.get(
  "/api/v1/orders",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const permission = ac.can(req.user.role).readOwn("orders");
    if (permission.granted) {
      let requester = "user";
      let field = "store";
      if (req.user.role === "store") {
        requester = "store";
        field = "user";
      }
      Order.find({ [requester]: req.user._id })
        .populate("items")
        .populate(field)
        .exec((err, orders) => {
          console.log(chalk.blue("Orders Router (Requested): "), orders);
          res.status(201).send(orders);
        });
    } else {
      res.status(403).send("Access denied!");
    }
  }
);

module.exports = router;
