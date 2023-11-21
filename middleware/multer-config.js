const multer = require('multer');
const SharpMulter = require('sharp-multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const newFilenameFunction = (og_filename, options) => {
  const newname = og_filename.split('.').slice(0, -1).join('.')+ Date.now() + '.' + options.fileFormat;
  return newname;
}

// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'images');
//   },
//   filename: (req, file, callback) => {
//     console.log(file)
//     const name = file.originalname.split(' ').join('_');
//     const extension = MIME_TYPES[file.mimetype];
//     callback(null, name + Date.now() + '.' + extension)
//   }
// });

const storage = SharpMulter({
  destination: (req, file, callback) => callback(null, 'images'),
  imageOptions: {
    fileFormat: 'avif',
    quality: 80,
    resize: { width: 206, height: 260, resizeMode: 'contain'},
  },
  filename: newFilenameFunction,
});

module.exports = multer({ storage: storage }).single('image');
