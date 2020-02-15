const express = require("express");
const router = new express.Router();
const passport = require("passport");
const AccessControl = require("accesscontrol");
const grants = require("../../grants");
const Item = require("../db/models/item");
const chalk = require("chalk");

const ac = new AccessControl(grants);

////////////////////// CREATE ITEM
router.post(
  "/api/v1/items",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const permission = ac.can(req.user.role).createOwn("items");
    if (permission.granted) {
      const item = new Item({
        ...req.body,
        owner: req.user._id
      });

      try {
        item.save().then(item => {
          console.log(chalk.blue("Item Router (Created): "), item);
          Item.find({ owner: req.user._id })
            .then(items => {
              res.status(201).send(items);
            })
            .catch(e => {
              res.status(500).send(e);
            });
        });
      } catch {
        res.status(400).send(e);
      }
    } else {
      res.status(403).send("Access denied!");
    }
  }
);

////////////////////// GET ITEMS
router.get(
  "/api/v1/items",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const permission = ac.can(req.user.role).readOwn("items");
    if (permission.granted) {
      Item.find({ owner: req.user._id })
        .then(items => {
          res.send(items);
        })
        .catch(e => {
          res.status(500).send(e);
        });
    } else {
      Item.find({})
        .then(items => {
          res.send(items);
        })
        .catch(e => {
          res.status(500).send(e);
        });
    }
  }
);

////////////////////// GET ITEM BY ID
router.get("/api/v1/items/:id", (req, res) => {
  Item.findById(req.params.id)
    .populate("owner", "name")
    .exec((err, item) => {
      console.log(chalk.blue("Item Router (by ID): "), item);
      res.send(item);
    });
});

////////////////////// DELETE ITEMS

router.delete(
  "/api/v1/items/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const item = await Item.findByIdAndDelete(req.params.id);
      console.log(chalk.blue("Item Router (Deleted): "), req.params.id);
      if (!item) {
        return res.status(400).send("Izabrani artikal ne postoji!");
      }

      Item.find({ owner: req.user.id })
        .then(items => {
          res.send(items);
        })
        .catch(e => {
          res.status(500).send(e);
        });
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

module.exports = router;
