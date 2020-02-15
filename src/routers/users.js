const express = require("express");
const router = new express.Router();
const User = require("../db/models/user");
const AccessControl = require("accesscontrol");
const grants = require("../../grants");
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const passport = require("passport");

////////////////////// SHORTCUTS
const ac = new AccessControl(grants);

////////////////////// LOGIN
router.post("/auth/v1/users/login", (req, res, next) => {
  passport.authenticate(
    "user",
    {
      session: false
    },
    async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).send({ error: info.message });
      }

      const token = await user.generateAuthToken();

      res
        .cookie(process.env.TOKEN_NAME, token, {
          httpOnly: true
        })
        .send({ jwt: token, user: user });
    }
  )(req, res, next);
});

////////////////////// CREATE USER
router.post("/api/v1/users", async (req, res) => {
  const user = new User(req.body);

  const token = await user.generateAuthToken();
  user
    .save()
    .then(newUser => {
      console.log(chalk.blue("Users Router (Registration): "), newUser);
      res
        .status(201)
        .cookie(process.env.TOKEN_NAME, token, {
          httpOnly: true
        })
        .send({ jwt: token, user: newUser });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

////////////////////// GET USER DATA
router.get(
  "/auth/v1/users/logged",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) res.status(200).send(req.user);
  }
);

////////////////////// GET ALL USERS
router.get(
  "/api/v1/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const permission = ac.can(req.user.role).readAny("user");
    if (permission.granted) {
      User.find({})
        .then(users => {
          console.log(chalk.blue("Users Router (Send Users): "), users);
          res.send(users);
        })
        .catch(e => {
          res.status(500).send(e);
        });
    } else {
      res.status(401).send("Access denied!");
    }
  }
);

////////////////////// LOGOUT
router.get("/auth/v1/users/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res
      .status(200)
      .clearCookie("jwt")
      .send("USPESNO STE SE ODJAVILI");
  } else {
    res.status(400).send();
  }
});

module.exports = router;
