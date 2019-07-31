const db = require('../setup/db');

const Student = function(student) {
  this.name = student.name;
  this.age = student.age;
  this.class_id = student.class_id;
  this.avatar_url = student.avatar_url;
};

Student.getAllStudent = function(result) {
  db.query(
    'SELECT Student.*, Class.name as class_name FROM Student, Class WHERE Student.class_id = Class.id',
    (err, res) => {
      result(err, res);
    }
  );
};

Student.createStudent = function(newStudent, result) {
  db.query(
    'INSERT INTO `Student` (`name`, `age`, `class_id`, `avatar_url`) VALUES (?, ?, ?, ?)',
    [newStudent.name, newStudent.age, newStudent.class_id, newStudent.avatar_url],
    (err, res) => {
      result(err, res);
    }
  );
};

Student.getStudentByID = function(studentId, result) {
  db.query('SELECT * FROM `Student` WHERE id = ?', [studentId], (err, res) => {
    result(err, res[0]);
  });
};

Student.updateStudentByID = function(id, newStudent, result) {
  db.query(
    'UPDATE `Student` SET `name` = ?, `age` = ?, `class_id` = ?, `avatar_url` = ? WHERE `id` = ?;',
    [newStudent.name, newStudent.age, newStudent.class_id, newStudent.avatar_url, id],
    (err, res) => {
      result(err, res);
    }
  );
};

Student.deleteStudentByID = function(id, result) {
  db.query('DELETE FROM `Student` WHERE `id` = ? ', [id], (err, res) => {
    result(err, res);
  });
};

module.exports = Student;
