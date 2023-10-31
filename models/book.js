const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true},
  title: {type: String, required: true},
  author: {type: String, required: true},
  imageUrl: {type: String, required: true},
  year: {type: Number, required: true},
  genre: {type: String, required: true},
  ratings: {type: Array, required: true},
  averageRating: {type: Number, required: true, default: 0}
}, {collection: 'books'})

module.exports = mongoose.model('Book', bookSchema)