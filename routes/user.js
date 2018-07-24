const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport =require('passport');
// ADDING USER MODELS
let User = require('../models/users');

//REGESTER FORM
router.get('/register', function (req, res) {
  res.render('register')
})

// ADD REGISTRATION REQUEST
router.post('/register', function (req, res) {

  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const confpassword = req.body.confpassword;

  req
    .checkBody('name', 'Name is required')
    .notEmpty();
  req
    .checkBody('email', 'Email is required')
    .notEmpty();
  req
    .checkBody('email', 'Email is Not valid')
    .isEmail();
  req
    .checkBody('username', 'username is required')
    .notEmpty();
  req
    .checkBody('password', 'password is required')
    .notEmpty();
  req
    .checkBody('confpassword', 'Password do not match')
    .equals(req.body.password);
  // get errors
  let errors = req.validationErrors();
  if (errors) {
    res.render('register', {errors: errors});
  } else {
    let newUser = new User({name: name, email: email, username: username, password: password});

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt
        .hash(newUser.password, salt, function (err, hash) {

          if (err) {
            console.log(err);

          }
          newUser.password = hash;
          newUser.save(function (err) {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash('success', 'Register Success')
              res.redirect('/users/login')
            }
          })

        })

    })
  }

});
//  LOGIN FORM
router.get('/login',function(req, res){
res.render('login')
})
// LOGIN PROCCESS
router.post('/login', function(req, res, next){
passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/users/login',
  faliureFlash: true
})(req, res, next)
})
// logout
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'loged out');
  res.redirect('/users/login');
})

module.exports = router;