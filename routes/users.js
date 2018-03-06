const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

const router = express.Router();

// Register
router.get('/register', (req, res) => {
  res.render('register');
});

// Login
router.get('/login', (rq, res) => {
  res.render('login');
});

// register user
router.post('/register', (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is Invalid').isEmail();
  req.checkBody('username', 'userame is required').notEmpty();
  req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('password1', 'Password do not match').equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    console.log(errors);
    res.render('register', { errors });
  } else {
    let newUser = new User({
      name,
      email,
      username,
      password
    });
    User.createUser(newUser, (err, user) => {
      if (err) {
        throw err;
      }
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
});

passport.use(
  new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      User.comparePassword(password, user.password, (error, isMatch) => {
        if (error) {
          return done(error);
        }
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Logged Out successfully');
  res.redirect('/users/login');
});
module.exports = router;
