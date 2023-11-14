const jwt = require('jsonwebtoken');
if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

module.exports = (req, res, next) => {
  try{
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, `${process.env.JSONWEBTOKENVALIDATOR}`);
    req.userId = decodedToken.userId;
    next();
    // if (req.body.userId && req.body.userId !== userId){
    //   throw 'Invalid user ID';
    // } else{
    //   next();
    // }

  } catch{
    res.status(401).json({
      message: 'Unauthorized'
    });
  }
};