const passport = require('passport');
const admin = require('../controllers/adminController');
const studentManage = require('../controllers/studentManageController');
const library = require('../controllers/libraryController');
const avatarUpload = require('../controllers/avatarUploadController');

module.exports = function api(app) {
  app.post('/api/login', admin.signIn);

  app.get(
    '/api/authenticate',
    passport.authenticate('jwt', { session: false }),
    admin.authenticate
  );

  app
    .route('/api/students/')
    .get(passport.authenticate('jwt', { session: false }), studentManage.getAllStudents)
    .post(passport.authenticate('jwt', { session: false }), studentManage.postNewStudent);

  app
    .route('/api/students/:studentId')
    .get(passport.authenticate('jwt', { session: false }), studentManage.getStudent)
    .put(passport.authenticate('jwt', { session: false }), studentManage.putStudent)
    .delete(passport.authenticate('jwt', { session: false }), studentManage.deleteStudent);

  app
    .route('/api/classes/')
    .get(passport.authenticate('jwt', { session: false }), studentManage.getAllClasses)
    .post(passport.authenticate('jwt', { session: false }), studentManage.postNewClass);

  app
    .route('/api/classes/:classId')
    .put(passport.authenticate('jwt', { session: false }), studentManage.putClass)
    .delete(passport.authenticate('jwt', { session: false }), studentManage.deleteClass);

  app
    .route('/api/library/book/')
    .get(passport.authenticate('jwt', { session: false }), library.getBooks)
    .post(passport.authenticate('jwt', { session: false }), library.postNewBook);

  app
    .route('/api/library/book/:bookId')
    .put(passport.authenticate('jwt', { session: false }), library.putBook)
    .delete(passport.authenticate('jwt', { session: false }), library.deleteBook);

  app
    .route('/api/library/book/:bookId/student_options')
    .get(passport.authenticate('jwt', { session: false }), library.getStudentOptions);

  app
    .route('/api/library/book/:bookId/borrow_records')
    .get(passport.authenticate('jwt', { session: false }), library.getBorrowRecord);

  app
    .route('/api/library/borrow_records/')
    .get(passport.authenticate('jwt', { session: false }), library.getAllBorrowRecord)
    .post(passport.authenticate('jwt', { session: false }), library.postNewBorrowRecord);

  app
    .route('/api/library/borrow_records/:recordId')
    .put(passport.authenticate('jwt', { session: false }), library.returnBorrowRecord);

  app
    .route('/api/library/unreturned_borrow_records/')
    .get(passport.authenticate('jwt', { session: false }), library.getUnreturned);

  app
    .route('/api/uploads')
    .post(passport.authenticate('jwt', { session: false }), avatarUpload.postNewAvatar);

  app
    .route('/api/uploads/:filename')
    .delete(passport.authenticate('jwt', { session: false }), avatarUpload.deleteAvatar);
};
