const db = require('../setup/db');

const Class = function(class_) {
  this.name = class_.name;
};

Class.getAllClass = function(result) {
  db.query('SELECT * FROM `Class`', (err, res) => {
    result(err, res);
  });
};

Class.createClass = function(newClass, result) {
  db.query('INSERT INTO `Class` (`name`) VALUES (?)', [newClass.name], (err, res) => {
    result(err, res);
  });
};

Class.updateClassByID = function(id, newClass, result) {
  db.query('UPDATE `Class` SET `name` = ? WHERE `id` = ?;', [newClass.name, id], (err, res) => {
    result(err, res);
  });
};

Class.deleteClassByID = function(id, result) {
  db.query('DELETE FROM `Class` WHERE `id` = ? ', [id], (err, res) => {
    result(err, res);
  });
};

module.exports = Class;
