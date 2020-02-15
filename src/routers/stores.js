const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const Store = require("../db/models/store");
const AccessControl = require("accesscontrol");
const grants = require("../../grants");
const passport = require("passport");

const chalk = require("chalk");
const ac = new AccessControl(grants);

/* PRODUCTION API  */

///////////////////// LOGIN
router.post("/auth/v1/stores/login", (req, res, next) => {
  passport.authenticate(
    "store",
    {
      session: false
    },
    async (err, store, info) => {
      if (err) {
        return next(err);
      }
      if (!store) {
        return res.status(400).send({ error: info.message });
      }

      const token = await store.generateAuthToken();
      res
        .cookie(process.env.TOKEN_NAME, token, {
          httpOnly: true
        })
        .send({ jwt: token, user: store });
    }
  )(req, res, next);
});

////////////////////// CREATE STORE
router.post("/api/v1/stores", (req, res) => {
  const store = new Store(req.body);
  console.log(chalk.blue("REGISTRATION: "), store);
  store
    .save()
    .then(newStore => {
      console.log(chalk.blue("Stores Router (Registration): "), newStore);
      res.status(201).send(newStore);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

////////////////////// GET STORE DATA
router.get(
  "/auth/v1/stores/logged",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) res.status(200).send(req.user);
  }
);

////////////////////// GET ALL STORES
router.get(
  "/api/v1/stores",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const permission = ac.can(req.user.role).readAny("store");
    if (permission.granted) {
      Store.find({})
        .then(stores => {
          res.status(200).send(stores);
        })
        .catch(e => {
          res.status(500).send(e);
        });
    } else {
      res.status(403).send("Access denied!");
    }
  }
);

////////////////////// GET STORE BY ID

router.get(
  "/api/v1/stores/:id",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // const permission = ac.can(req.user.role).readAny("store");
    // if (permission.granted) {

    Store.findById(req.params.id)
      .populate("items")
      .exec((err, store) => {
        const data = { store, products: store.items };
        res.send(data);
      });
    // } else {
    //   res.status(403).send("Access denied!");
    // }
  }
);

////////////////////// LOGOUT
router.get(
  "/auth/v1/stores/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log(chalk.blue("Stores Router (Logout): "), req.cookies);
    if (req.cookies) {
      res
        .status(200)
        .cookie(process.env.TOKEN_NAME, "", {
          expires: new Date(0),
          httpOnly: true
        })
        //DELETE SOCKET IO COOKIE
        .cookie("io", "", { expires: new Date(0) })
        .send("Uspesno ste odjavljeni.");
    } else {
      res.status(400).send();
    }
  }
);

/* DEVELOPMENT API */

router.get("/api/dev/stores", async (req, res) => {
  Store.find({})
    .populate({
      path: "items"
    })
    .exec((err, stores) => {
      console.log(chalk.blue("Stores Router (DEV): "), stores);
      res.status(200).send(stores);
    });
});

module.exports = router;
