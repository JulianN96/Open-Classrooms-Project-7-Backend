const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mongoDBURL = `mongodb+srv://${process.env.MONGODBUSER}:${process.env.MONGODBPASSWORD}@${process.env.MONGODBADDRESS}/?retryWrites=true&w=majority`;

const app = express();

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

app.use(express.json());

mongoose
  .connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connection to DB Successful');
  })
  .catch((error) => {
    console.log(error);
  });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.all('*', (req, res) => {
  res.status(404).json({
    message: 'Error, endpoint not found',
  });
});

module.exports = app;
