const JwtStrategy = require('passport-jwt').Strategy;
const admin = require('../models/adminModel');
const config = require('./config');

module.exports = new JwtStrategy(
  {
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: config.secretKey
  },
  (jstPayload, done) => {
    admin.findOneByUsername(jstPayload.username, function(err, admins) {
      if (err) {
        return done(err, false);
      }
      if (Date.now() > jstPayload.expires) {
        return done('jwt expired', false);
      }
      return done(null, admins[0]);
    });
  }
);
