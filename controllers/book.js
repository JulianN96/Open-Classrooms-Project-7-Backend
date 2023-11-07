const fs = require('fs');
const Book = require('../models/book');

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
  req.body.book = JSON.parse(req.body.book);
  const book = new Book({
    title: req.body.book.title,
    userId: req.body.book.userId,
    author: req.body.book.author,
    imageUrl: url + '/images/' + req.file.filename,
    year: req.body.book.year,
    genre: req.body.book.genre,
    ratings: req.body.book.ratings,
    averageRating: req.body.book.ratings[0].grade,
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
      res.status(200).json(book);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(404).json({
          error: 'Aucun Livre avec cet ID retrouvé ' + error,
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
    console.log(obook);
    let book = Book({ _id: req.params.id });
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      req.body.book = JSON.parse(req.body.book);
      book = {
        title: req.body.book.title,
        userId: req.body.book.userId,
        author: req.body.book.author,
        imageURL: url + '/images/' + req.file.filename,
        year: req.body.book.year,
        genre: req.body.book.genre,
        ratings: obook.ratings,
      };
    } else {
      book = {
        title: req.body.title,
        userId: req.body.userId,
        author: req.body.author,
        imageURL: obook.imageURL,
        year: req.body.year,
        genre: req.body.genre,
        ratings: obook.ratings,
      };
    }
    let totalRating = 0;
    book.ratings.forEach((rating) => {
      totalRating = totalRating + rating.grade;
    });
    let averageRating = totalRating / book.ratings.length;
    book.averageRating = averageRating;
    console.log(book);
    Book.updateOne({ _id: req.params.id }, book)
      .then(() => {
        res.status(201).json({
          message: 'Book updated Successfully',
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({
          error: `Erreur, ce livre n'a pu etre modifié` + error,
        });
      });
  });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
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
  console.log(req.params);
  console.log(req.body);
  let newRating = {
    userId: req.body.userId,
    grade: req.body.rating,
  };
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if(!book){
        return res.status(404).json({
          message: 'Book not found'
        })
      }
      console.log('*****', book)
      book.ratings.push(newRating);
      book.averageRating = averageRatingCalculator(book);
      console.log(book);
      book.save()
      .then(() => {
        res.status(201).json(book);
      })
      .catch(
        (error) => {
        res.status(400).json({
          message: 'Avis pas ajoute' + error
        })
      })
    })
};
