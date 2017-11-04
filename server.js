var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users = [];
var connections = [];

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
   connections.push(socket);
   console.log('Connected: %s socket connected.', connections.length);
   socket.on('disconnect', function () {
      users.splice(users.indexOf(socket.username), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);
      console.log('Disconnected: %s socket connected.', connections.length);
   });

   socket.on('send message', function (data) {
       io.sockets.emit('new message', {msg: data, user: socket.username});
   });

   // New user
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames() {
       io.sockets.emit('get users', users);
    }

    socket.on('typing', function() {
        //io.sockets.emit('user typing', socket.username);
        socket.broadcast.emit('user typing', socket.username);
    });
});