const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expHbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/loginapp');
let db = mongoose.connection;

const routes = require('./routes/index');
const users = require('./routes/users');

// init app
const app = express();

// mongoose connection testing
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Mongodb Connection successful');
});

// middleware view engine
app.set('views', path.join(`${__dirname}`, './views'));
app.engine('handlebars', expHbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// bodyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// set static folder
app.use(express.static(path.resolve(__dirname, 'public')));

// express session middleware
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  })
);

// passport init
app.use(passport.initialize());
app.use(passport.session());

// express-validator middleware
app.use(
  expressValidator({
    errorFormatter: (param, msg, value, location) => {
      let namespace = param.split('.');
      let root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return { param: formParam, msg, value };
    }
  })
);

// connect-flash middleware
app.use(flash());

// global vars for flash msgs
app.use((req, res, next) => {
  // With the flash middleware in place, all requests will have a req.flash() function that can be used for flash messages.
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// setup routes
app.use('/', routes);
app.use('/users', users);

// set port
// app.set('port', process.env.port || 3000);
const port = process.env.port || 3000;
let hostAddress = 'http://localhost';

app.listen(port, () => {
  console.log(`server started on ${hostAddress}:${port}`);
});
