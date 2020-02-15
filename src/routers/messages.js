const express = require("express");
const router = new express.Router();
const AccessControl = require("accesscontrol");
const passport = require("passport");
const grants = require("../../grants");
const Store = require("../db/models/store");
const { Message, Connection } = require("../db/models/messages");
const mongoose = require("mongoose");

const chalk = require("chalk");
const ac = new AccessControl(grants);

router.get(
  "/api/v1/connections",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const connections = await Connection.aggregate([
        { $match: { authors: req.user._id } },

        {
          $lookup: {
            from: "users",
            let: { authors: "$authors" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$authors"] } } },
              {
                $project: {
                  name: {
                    $concat: ["$firstname", " ", "$lastname"]
                  }
                }
              }
            ],
            as: "userName"
          }
        },
        {
          $lookup: {
            from: "stores",
            let: { authors: "$authors" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$authors"] } } },
              {
                $project: {
                  name: "$name"
                }
              }
            ],
            as: "storeName"
          }
        },
        {
          $project: {
            messages: 1,
            orders: 1,
            authors: { $concatArrays: ["$userName", "$storeName"] },
            consumer: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: { $concatArrays: ["$userName", "$storeName"] },
                    as: "authors",
                    cond: { $ne: ["$$authors._id", req.user._id] }
                  }
                },
                0
              ]
            }
          }
        }
      ]);
      console.log(
        chalk.blue("Messages Router (Send Connections): "),
        connections
      );
      res.status(200).send(connections);
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

module.exports = router;
