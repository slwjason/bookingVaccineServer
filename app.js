var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/archives');
var pointRouter = require('./routes/point');
var appointmentRouter = require('./routes/appointment')
var hospitalRouter = require('./routes/hospital')
var vaccineRouter = require('./routes/vaccine')
var firstRouter = require('./routes/first')
var archivesFormalRouter = require('./routes/archivesFormal')
var messageRouter = require('./routes/message')
var secondRouter = require('./routes/second')

var app = express();


//解决跨域问题
app.all("*", function(req, res, next) {

  if (!req.get("Origin")) return next();

  //设置允许跨域的域名，*代表允许任意域名跨域
  res.set("Access-Control-Allow-Origin","*");
  //跨域允许的请求方式
  res.set("Access-Control-Allow-Methods", "*");
  //允许的header类型
  res.set("Access-Control-Allow-Headers", "*");
  res.set("Access-Control-Request-Headers","*")
  res.header('Access-Control-Allow-Credentials', 'true');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ("OPTIONS" === req.method) return res.sendStatus(200); //让options尝试请求快速结束
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/hospital', hospitalRouter);
app.use('/archives', usersRouter);
app.use('/archivesFormal', archivesFormalRouter);
app.use('/point', pointRouter);
app.use('/appointment', appointmentRouter);
app.use('/vaccine', vaccineRouter);
app.use('/first',firstRouter)
app.use('/message',messageRouter)
app.use('/second',secondRouter)


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

module.exports = app;
