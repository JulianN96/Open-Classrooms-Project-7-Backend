const fs = require('fs');
const Book = require('../models/book');

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
    ratings: req.body.book.ratings
  });
  book.save().then(
    () => {
      res.status(201).json({
        message: 'Book created Succesfully'
      });

    }
  ).catch(
    (error) => {
      console.log(error)
      res.status(400).json({
        error: error
      })
    }
  )
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    } 
    //TODO ADD 404 HERE
  ).catch(
    (error) => {
      res.status(500).json({
        error: error
      })
    }
  )
}

exports.modifyBook = (req, res, next) => {
  let book = new Book({_id: req.params._id});
  if (req.file){
    const url = req.protocol + '://' + req.get('host');
    req.body.book = JSON.parse(req.body.book);
    book = {
      _id: req.params.id,
      title: req.body.book.title,
      userId: req.body.book.userId,
      author: req.body.book.author,
      imageURL: url + '/images/' + req.file.filename,
      year: req.body.book.year,
      genre: req.body.book.genre,
      ratings: req.body.book.ratings
    };
  } else{
    book = {
      _id: req.params.id,
      title: req.body.title,
      userId: req.body.userId,
      author: req.body.author,
      imageURL: req.body.imageURL,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings
    };
  }
  console.log(book)
  Book.updateOne({_id: req.params.id, book})
    .then(
    () => {
      res.status(201).json({
        message: 'Book updated Successfully'
      });
    }
  ).catch(
    (error) => {
      console.log(error)
      res.status(400).json({
        error: error
      })
    }
  )
}

exports.deleteBook = (req,res,next) => {
  Book.findOne({_id: req.params.id})
  .then(
    (book) => {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink('images/' + filename, () => {
        Book.deleteOne({_id: req.params.id})
        .then(
          ()=> {
            res.status(200).json({
              message: 'Deleted'
            })
          }
        ).catch(
          (error)=>{
            res.status(400).json({
              error: error
            })
          }
        )
      })
    }
  )
}

exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(
        books
      );
      console.log(books)
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      })
    }
  )
}