var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var userRouter = require('./routes/users');
var mainRouter = require('./routes/main');
var expressValidator= require('express-validator');
var app = express();
//Authentication packages
var session = require('express-session');

// view engine setup
app.engine('hbs',hbs({
  extname:'hbs',defaultLayout:'layout',
   layoutDir: __dirname + '/views/layouts/',
   helpers:{
     toNumbers : (val=>{
       return Math.max(...val);
     })
   }
  }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret : 'asdfgfsdfsadfdggfls',
  resave : false,
  saveUninitialized : true,
}));

app.use(expressValidator());
app.use('/', userRouter);
app.use('/main', mainRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(3000, () => {  console.log('Express server listening on port 3000') })


module.exports = app;
