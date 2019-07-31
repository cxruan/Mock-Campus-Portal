const db = require('../setup/db');

const BorrowRecord = function(borrowRecord) {
  this.book_id = borrowRecord.book_id;
  this.borrower_id = borrowRecord.borrower_id;
  this.lend_time = borrowRecord.lend_time;
  this.expected_return_time = borrowRecord.expected_return_time;
  this.actual_return_time = borrowRecord.actual_return_time;
};

BorrowRecord.getAllUnreturnedBorrowRecords = function(next) {
  db.query(
    `
SELECT
	BorrowRecord.*,
	Book.name AS book_name,
	Student.name AS borrower_name,
	Student.avatar_url AS borrower_avatar_url
FROM
	BorrowRecord,
	Student,
	Book
WHERE
  Student.id = BorrowRecord.borrower_id AND Book.id = BorrowRecord.book_id AND ISNULL(actual_return_time);`,
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.getAllBorrowRecords = function(next) {
  db.query(
    `
  SELECT
  BorrowRecord.*,
  Student.name AS borrower_name,
  Book.name AS book_name
FROM
  BorrowRecord,
  Student,
  Book
WHERE
  Student.id = BorrowRecord.borrower_id AND Book.id = BorrowRecord.book_id`,
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.getBorrowRecordByBookID = function(bookId, next) {
  db.query(
    `
SELECT
	BorrowRecord.*,
	Student.name AS borrower_name
FROM
	BorrowRecord,
	Student
WHERE
  Student.id = BorrowRecord.borrower_id AND BorrowRecord.book_id = ?`,
    [bookId],
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.getStudentOptionsByBookID = function(bookId, next) {
  db.query(
    `
SELECT
	id,
	name,
	CASE WHEN id IN (SELECT borrower_id from BorrowRecord WHERE actual_return_time is NULL AND book_id=?) THEN
		"yes"
	ELSE
		"no"
	END AS disabled
FROM Student`,
    [bookId],
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.createBorrowRecord = function(newRecord, next) {
  db.query(
    `INSERT INTO BorrowRecord (book_id, borrower_id, lend_time, expected_return_time, actual_return_time) VALUES (?, ?, ?, ?, ?);`,
    [
      newRecord.book_id,
      newRecord.borrower_id,
      newRecord.lend_time,
      newRecord.expected_return_time,
      newRecord.actual_return_time
    ],
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.decrementCopies = function(bookId, next) {
  db.query('UPDATE Book SET num_of_copies = num_of_copies-1 WHERE id=?;', bookId, (err, res) => {
    next(err, res);
  });
};

BorrowRecord.setReturnTime = function(returnTime, recordId, next) {
  db.query(
    `UPDATE BorrowRecord SET actual_return_time = ? WHERE id = ?;`,
    [returnTime, recordId],
    (err, res) => {
      next(err, res);
    }
  );
};

BorrowRecord.incrementCopies = function(bookId, next) {
  db.query('UPDATE Book SET num_of_copies = num_of_copies+1 WHERE id=?;', bookId, (err, res) => {
    next(err, res);
  });
};

module.exports = BorrowRecord;
