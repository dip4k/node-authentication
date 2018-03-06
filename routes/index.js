const express = require('express');

const router = express.Router();

// homepage
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Not logged in');
  res.redirect('/users/login');
}

module.exports = router;
