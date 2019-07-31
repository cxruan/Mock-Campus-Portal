const db = require('../setup/db');

module.exports.findOneById = function(id, next) {
  db.query('SELECT * FROM ADMIN WHERE id=? LIMIT 1', [id], (err, res) => {
    next(err, res);
  });
};

module.exports.findOneByUsername = function(username, next) {
  db.query('SELECT * FROM ADMIN WHERE username=? LIMIT 1', [username], (err, res) => {
    next(err, res);
  });
};
