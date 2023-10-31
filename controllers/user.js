const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
  //TODO ADD PASSWORD VERIFICATION (No only spaces, not less than 8 characters, complex) AND EMAIL VERIFICATION. Add secruity plugin to stop brute force attacks
  bcrypt.hash(req.body.password, 10).then(
    (hash) => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(
        () => {
          res.status(201).json({
            message: 'User added Successfully'
          });
        }
      ).catch(
        (error)=> {
          res.status(500).json({
            error: error
          })
        }
      )
    }
  )
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email}).then(
    (user) => {
      if(!user){
        return res.status(401).json({
          error: new Error('User not found')
        });
      }
      bcrypt.compare(req.body.password, user.password).then(
        (valid) => {
          if(!valid){
            return res.status(401).json({
              error: new Error('Incorrect Password')
            });
          }
          const token = jwt.sign(
            {userId: user._id},
             'random_token_secret',
            {expiresIn: '24h'}
            );
          res.status(200).json({
            userId: user._id,
            token: token
          })
        }
      ).catch(
        (error) => {
          res.status(500).json({
            error: error
          })
        }
      )
    }
  ).catch(
    (error)=> {
      res.status(500).json({
        error: error
      })
    }
  )
};