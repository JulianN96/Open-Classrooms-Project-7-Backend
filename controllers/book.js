const fs = require('fs');
const Book = require('../models/book');
// const { Error } = require('mongoose');

function averageRatingCalculator(book) {
  let totalRating = 0;
  book.ratings.forEach((rating) => {
    totalRating = totalRating + rating.grade;
  });
  let averageRating = totalRating / book.ratings.length;
  return averageRating;
}

exports.createBook = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const bookobject = JSON.parse(req.body.book);
  if (!req.file) {
    return res.status(400).json({
      message: 'No image detected',
    });
  }
  const book = new Book({
    ...bookobject,
    userId: req.userId,
    imageUrl: url + '/images/' + req.file.filename,
    ratings: [],
    averageRating: 0,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({
        message: 'Book created Succesfully',
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      if (!book) {
        return res.status(404).json({
          message: 'Aucun Livre avec cet ID retrouvé',
        });
      }
      res.status(200).json(book);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(404).json({
          error: 'Aucun Livre retrouvé ' + error,
        });
      } else if (error) {
        res.status(500).json({
          error: 'Erreur du serveur: ' + error,
        });
      }
    });
};

exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((obook) => {
    if (!obook) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }
    //Checks for unauthorized modification
    if (req.userId != obook.userId) {
      console.log(
        'Attempted modification of a book by an author different that its origin. 403 sent'
      );
      return res.status(403).json({
        message:
          'You did not create this book and are not authorized to modify it',
      });
    }

    //Try catch block to check for JSON data type
    try {
      req.body.book = JSON.parse(req.body.book);
    }
    catch(error){
      console.log('Error, expected JSON object, not raw data')
      return res.status(400).json({
        message: 'Error, expected JSON object but received Raw data'
      })
    }
    let book = Book({ _id: req.params.id });
    //Checks for any missing elements
    if (
      !req.body.book.title ||
      !req.body.book.author ||
      !req.body.book.year ||
      !req.body.book.genre
    ) {
      console.log(
        'Error, an element is missing from the incoming request body'
      );
      return res.status(400).json({
        message:
          'The title, author, year or genre is missing from this update request',
      });
    } 
    //Checks for only spaces in the fields
    else if (
      !req.body.book.title.trim().length ||
      !req.body.book.author.trim().length ||
      req.body.book.year == NaN ||
      !req.body.book.genre.trim().length
    ) {
      console.log(
        'Error, an element is not formatted correctly from the incoming request body'
      );
      return res.status(422).json({
        error:
          'The title, author, year or genre is missing from this update request',
      });
    }
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      book = {
        title: req.body.book.title,
        userId: obook.userId,
        author: req.body.book.author,
        imageUrl: url + '/images/' + req.file.filename,
        year: req.body.book.year,
        genre: req.body.book.genre,
        ratings: obook.ratings,
        averageRating: obook.averageRating,
      };

    } else {
      book = {
        title: req.body.title,
        userId: obook.userId,
        author: req.body.author,
        imageUrl: obook.imageURL,
        year: req.body.year,
        genre: req.body.genre,
        ratings: obook.ratings,
        averageRating: obook.averageRating,
      };
    }
    Book.updateOne({ _id: req.params.id }, book)
      .then(() => {
        if(req.file){
          const filename = obook.imageUrl.split('/images/')[1];
          console.log('OBOOK = ' + obook)
          console.log('images/' + filename)
          fs.unlink('images/' + filename, () => {
            console.log('Modified image changed and old image deleted successfully')
          })
        }
        res.status(200).json({
          message: 'Book updated Successfully',
        });
      })
      .catch((error) => {
        console.log('Error, server error' + error);
        res.status(400).json({
          error: `Erreur, ce livre n'a pu etre modifié` + error,
        });
      });
  });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }
    if (book.userId != req.userId) {
      console.log(book.userId);
      console.log(req.userId);
      console.log('Book deletion attempt failed');
      return res.status(403).json({
        message:
          'You did not create this book and are not authorized to delete it',
      });
    }
    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink('images/' + filename, () => {
      Book.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: 'Deleted',
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: `Erreur, ce livre n'a pu etre supprimé` + error,
          });
        });
    });
  });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
      console.log(books);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(404).json({
        message: 'Error returning best books : ' + error,
      });
    });
};

exports.addRating = (req, res, next) => {
  if (!req.body.userId || !req.body.rating) {
    console.log('Error, UserId or Rating from incoming request.');
    return res.status(400).json({
      message: 'Error: elements missing from new rating',
    });
  }
  let newRating = {
    userId: req.body.userId,
    grade: req.body.rating,
  };
  if (newRating.grade < 0 || newRating.grade > 5) {
    return res.status(400).json({
      message:
        'Error with new rating. Rating cannot be higher than 5 or lower than 0.',
    });
  }
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }
    const userIdMatch = function isSameUser(existingRating) {
      return existingRating.userId == newRating.userId;
    };
    const exists = book.ratings.find(userIdMatch);
    if (exists) {
      console.log('Error: Rating from that UserId already present. 400 Sent.');
      return res.status(400).json({
        message: 'You have already left a review for this book',
      });
    }
    book.ratings.push(newRating);
    book.averageRating = averageRatingCalculator(book);
    book
      .save()
      .then(() => {
        console.log(
          `Added rating from ${newRating.userId} to book ${book.title} successfully`
        );
        res.status(201).json(book);
      })
      .catch((error) => {
        res.status(400).json({
          message: 'Avis pas ajoute' + error,
        });
      });
  });
};
