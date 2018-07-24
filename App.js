const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport')
const config = require('./config/database');

//  CONNECT TO DB
mongoose.connect(config.database);
let db = mongoose.connection;

// CHECK CONNECTION
db.once('open', function () {
  console.log('database connected')
})

// CHECKING FOR ERRORS
db.on('error', function (err) {
  console.log(err)
})

// INITILEIZING APP
const App = express();

// ADDING MODELS
let Article = require('./models/article');

// LOAD VIEW ENGINE
App.set('views', path.join(__dirname, 'views'));
App.set('view engine', 'pug');

// INCLUDING BODY PARSER
App.use(bodyParser.urlencoded({extended: false}));
App.use(bodyParser.json())

// SET PUBLIC FOLDER
App.use(express.static(path.join(__dirname, 'public')));

//  EXPRESS SESSION MIDDLEWARE SETUP
App.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

//  EXPRESS MESSAGE MIDDLEWARE SETUP
App.use(require('connect-flash')());
App.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
App.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {param: formParam, msg: msg, value: value};
  }
}));
//  PASSPORT CONFIG

require('./config/passport')(passport)
//  PASPORT MIDDLEWARE
App.use(passport.initialize());
App.use(passport.session());

App.get('*', function(req, res, next){
  res.locals.user=req.user || null;
  next();

})



// SETTING UP THE ROUTES HOME ROUTE
App.get('/', function (req, res) {
  Article
    .find({}, function (err, articles) {
      if (err) {
        console.log(err)
      } else {
        res.render('index', {
          title: 'Articles',
          articles: articles
        })
      }

    })

})
// WEB API
App.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
//  ROUTE FILES

let articles = require('./routes/articles');
App.use('/articles', articles);

let users = require('./routes/user');
App.use('/users', users);

// STARTING SERVER
App.listen(3000, function () {
  console.log('server started')
})