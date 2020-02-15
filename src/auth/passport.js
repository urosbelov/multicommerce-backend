const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

//LOAD MODEL

const User = require("../db/models/user");
const Store = require("../db/models/store");

cookieJwtExtractor = function(req) {
  var token = null;

  if (req && req.cookies) {
    token = req.cookies[process.env.TOKEN_NAME];
  } else {
  }

  return token;
};

module.exports = function(passport) {
  passport.use(
    "user",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        User.findOne({ email: email }, async (err, user, info) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: "Željeni korisnik ne postoji."
            });
          }

          if (password != user.password) {
            return done(null, false, {
              message: "Molimo Vas da proverite lozinku."
            });
          }
          return done(null, user);
        });
      }
    )
  );

  passport.use(
    "store",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        Store.findOne({ email: email }, async (err, store, info) => {
          if (err) {
            return done(err);
          }
          if (!store) {
            return done(null, false, {
              message: "Željena prodavnica ne postoji."
            });
          }

          if (password != store.password) {
            return done(null, false, {
              message: "Molimo Vas da proverite lozinku."
            });
          }
          return done(null, store);
        });
      }
    )
  );

  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromExtractors([
    cookieJwtExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken()
  ]);
  opts.secretOrKey = process.env.TOKEN_SECRET;

  passport.use(
    new JwtStrategy(opts, function(jwt_payload, done) {
      if (jwt_payload.role == "store") {
        Store.findById({ _id: jwt_payload._id }, function(err, store) {
          if (err) {
            return done(err, false, { message: "Passport error" });
          }
          if (store) {
            return done(null, store);
          } else {
            return done(null, false, {
              message: "Molimo Vas da proverite podatke."
            });
          }
        });
      } else
        User.findById({ _id: jwt_payload._id }, function(err, user) {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
    })
  );
};
