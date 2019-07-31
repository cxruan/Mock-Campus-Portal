const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admin = require('../models/adminModel');
const config = require('../setup/config');

exports.signIn = (req, res) => {
  const { username, password } = req.body;
  admin.findOneByUsername(username, function(err, admins) {
    if (err) {
      res.status(401).json({ msg: 'Error' });
      return;
    }
    if (!admins[0]) {
      res.status(401).json({ msg: 'Admin not found' });
      return;
    }
    bcrypt.compare(password, admins[0].password, function(_err, response) {
      if (!response) {
        return res.status(401).json({ msg: 'Auth Failed' });
      }
      const payload = {
        username,
        exp: Date.now() + parseInt(config.jwtExpireTime, 10)
      };
      const token = jwt.sign(JSON.stringify(payload), config.secretKey);
      res.cookie('jwt', token, { expires: new Date(payload.exp), httpOnly: false });
      return res.status(200).json({
        msg: 'Auth Passed',
        token
      });
    });
  });
};

exports.authenticate = (req, res) => {
  return res.status(200).send({ msg: 'Auth Passed' });
};
