const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const passwordFormatError = 'Mot de passe doit contenir un minimum de 8 charactères, des lettres majuscules et miniuscules, un chiffre et un charactère special'
const emailFormatError = `Votre addresse mail n'est pas valide`
const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const passwordStrengthTester = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

exports.signup = (req, res, next) => {
  //Email format checker
  if(!req.body.email.match(validRegex)){
    res.status(500).json({
      error: emailFormatError
    })
  } 
  //Password checker for onlyspaces
  if(!req.body.password.trim().length){
    res.status(500).json({
      error: passwordFormatError
    })
  }
  //Password Strength Checker
  if(!passwordStrengthTester.test(req.body.password)){
    res.status(500).json({
      error: passwordFormatError
    })
  }
  else if(req.body.password.trim().length){
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
  }
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