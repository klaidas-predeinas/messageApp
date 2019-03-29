var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var steamUsers = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log(socket["handshake"]["time"].split("2019 ")[1].split(" ")[0]);
  steamUsers[socket.id] = "user"+Object.keys(steamUsers).length;

  console.log(`${steamUsers[socket.id]} connected`);
  io.emit('chat message', `${steamUsers[socket.id]} connected`);

  socket.on('disconnect', function(){
    console.log(`${steamUsers[socket.id]} disconnected`);
    io.emit('chat message', `${steamUsers[socket.id]} disconnected`);

    delete steamUsers[socket.id]
  });

  socket.on('chat message', function(msg){
    console.log(`[${socket["handshake"]["time"].split("2019 ")[1].split(" ")[0]}][${steamUsers[socket.id]}] message: ` + msg);
    io.emit('chat message', `[${socket["handshake"]["time"].split("2019 ")[1].split(" ")[0]}][${steamUsers[socket.id]}] message: ` + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
