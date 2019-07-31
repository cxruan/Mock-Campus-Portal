const Book = require('../models/bookModel');
const BorrowRecord = require('../models/borrowRecordModel');

exports.getBooks = function(req, res) {
  Book.getAllBook(function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ books: response });
  });
};

exports.postNewBook = function(req, res) {
  Book.createBook(new Book(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: 'New Book created' });
  });
};

exports.putBook = function(req, res) {
  Book.updateBookByID(req.params.bookId, new Book(req.body), function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Book id=${req.params.bookId} updated` });
  });
};

exports.deleteBook = function(req, res) {
  Book.deleteBookByID(req.params.bookId, function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: `Book id=${req.params.bookId} deleted` });
  });
};

exports.getAllBorrowRecord = function(req, res) {
  BorrowRecord.getAllBorrowRecords(function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ borrow_records: response });
  });
};

exports.getBorrowRecord = function(req, res) {
  BorrowRecord.getBorrowRecordByBookID(req.params.bookId, function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ borrow_records: response });
  });
};

exports.getStudentOptions = function(req, res) {
  BorrowRecord.getStudentOptionsByBookID(req.params.bookId, function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send(response);
  });
};

exports.getStudentOptions = function(req, res) {
  BorrowRecord.getStudentOptionsByBookID(req.params.bookId, function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send(response);
  });
};

exports.postNewBorrowRecord = function(req, res) {
  BorrowRecord.createBorrowRecord(new BorrowRecord(req.body), function(err1) {
    if (err1) {
      res.status(404).send({ status: 0, ...err1 });
      return;
    }
    BorrowRecord.decrementCopies(req.body.book_id, function(err2) {
      if (err2) {
        return res.status(404).send({ status: 0, ...err2 });
      }
      return res.send({ status: 1, msg: 'New BorrowRecord created' });
    });
  });
};

exports.returnBorrowRecord = function(req, res) {
  BorrowRecord.setReturnTime(req.body.actual_return_time, req.params.recordId, function(err1) {
    if (err1) {
      res.status(404).send({ status: 0, ...err1 });
      return;
    }
    BorrowRecord.incrementCopies(req.body.book_id, function(err2) {
      if (err2) {
        return res.status(404).send({ status: 0, ...err2 });
      }
      return res.send({ status: 1, msg: 'Book returned' });
    });
  });
};

exports.getUnreturned = function(req, res) {
  BorrowRecord.getAllUnreturnedBorrowRecords(function(err, response) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ unreturned_books: response });
  });
};
