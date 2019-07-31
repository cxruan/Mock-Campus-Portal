const db = require('../setup/db');

const Book = function(book) {
  this.name = book.name;
  this.num_of_copies = book.num_of_copies;
};

Book.getAllBook = function(next) {
  db.query(`SELECT * FROM Book`, (err, res) => {
    next(err, res);
  });
};

Book.createBook = function(newBook, next) {
  db.query(
    'INSERT INTO `Book` (`name`, `num_of_copies`) VALUES (?, ?)',
    [newBook.name, newBook.num_of_copies],
    (err, res) => {
      next(err, res);
    }
  );
};

Book.updateBookByID = function(id, newBook, next) {
  db.query(
    'UPDATE `Book` SET `name` = ?, `num_of_copies` = ? WHERE `id` = ?;',
    [newBook.name, newBook.num_of_copies, id],
    (err, res) => {
      next(err, res);
    }
  );
};

Book.deleteBookByID = function(id, next) {
  db.query('DELETE FROM `Book` WHERE `id` = ? ', [id], (err, res) => {
    next(err, res);
  });
};

module.exports = Book;
