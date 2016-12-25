var express = require('express');
var path = require('path');
var logger = require('morgan');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger(app.get('env') === 'development' ? 'dev' : 'tiny'));
// Static
app.use(express.static(path.join(__dirname, 'public')));
// Includes
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/fonts')));

app.use('/media', express.static(path.join(__dirname, 'media')));

// Run Express
var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function () {
  console.log('Server listening on *:' + port);
});

app.get('/', function (req, res) {
  res.render('index');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

var state = {
  source: '',
  playing: false,
  time: 0,
  timestamp: 0
};

io.on('connection', function(socket) {
  if (state.playing) {
    state.time = ((new Date) - state.timestamp) / 1000;
  }
  socket.emit('media', {
    action: 'sync',
    state: state
  });

  console.log(socket.id + ' has connnected');
  socket.broadcast.emit('users', {action: 'connected', id: socket.id});
  
  socket.on('disconnect', function() {
    console.log(socket.id + ' has disconnnected');
    socket.broadcast.emit('users', {action: 'disconnected', id: socket.id});
  });

  socket.on('media', function(data) {
    socket.broadcast.emit('media', data);
    state.time = data.state.time;
    state.timestamp = new Date;
    switch (data.action) {
      case 'play':
        state.playing = true;
        break;
      case 'pause':
        state.playing = false;
        break;
      case 'open':
        state.source = data.source;
        state.time = 0;
        state.playing = false;
        break;
      default:
        break;
    }
    console.log(socket.id + ' media:' + JSON.stringify(data));
  });
});

// Helpers
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
