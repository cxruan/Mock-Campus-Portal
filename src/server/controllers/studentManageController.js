const Class = require('../models/classModel');
const Student = require('../models/studentModel');

exports.getAllClasses = function(req, res) {
  Class.getAllClass(function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ classes: response });
  });
};

exports.postNewClass = function(req, res) {
  Class.createClass(new Class(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: 'New class created' });
  });
};

exports.putClass = function(req, res) {
  Class.updateClassByID(req.params.classId, new Class(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Class id=${req.params.classId} updated` });
  });
};

exports.deleteClass = function(req, res) {
  Class.deleteClassByID(req.params.classId, function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Class id=${req.params.classId} deleted` });
  });
};

exports.getAllStudents = function(req, res) {
  Student.getAllStudent(function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ students: response });
  });
};

exports.postNewStudent = function(req, res) {
  Student.createStudent(new Student(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: 'New student created' });
  });
};

exports.getStudent = function(req, res) {
  Student.getStudentByID(req.params.studentId, function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send(response);
  });
};

exports.putStudent = function(req, res) {
  Student.updateStudentByID(req.params.studentId, new Student(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Student id=${req.params.studentId} updated` });
  });
};

exports.deleteStudent = function(req, res) {
  Student.deleteStudentByID(req.params.studentId, function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Student id=${req.params.studentId} deleted` });
  });
};
