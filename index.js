var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

let rawdata = fs.readFileSync('messages.json');
let prevMessage = JSON.parse(rawdata)[0];

let userList = [];
let brokenSyntax = ['"', '[', ']', '{', '}', '(', ')']

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log(`user connected`);

  io.emit('clear message')
  for (let loop = 0;loop < prevMessage["messages"].length; loop++) {
    io.emit('chat message', `[${prevMessage["messages"][loop]["timeStamp"]}] ${prevMessage["messages"][loop]["sentBy"]}: ${prevMessage["messages"][loop]["message"]}`)
  }

  socket.on("user name", function(user) {
    if (userList.includes(user)) return
    userList.push(user);
    socket.on('chat message', function(msg){
      if (msg == "") return
      for (let loopBroken = 0; loopBroken < brokenSyntax.length; loopBroken++) {
        if (msg.includes(brokenSyntax[loopBroken])) return
      }
      //io.to(t[3]).emit("chat message", msg)
      io.emit('chat message', `[${socket["handshake"]["time"].split("2019 ")[1].split(" ")[0]}] ${user}: ` + msg);
      if (prevMessage["messages"].length == 49) {
        prevMessage["messages"].splice(0,1);
      }
      prevMessage["messages"].push({"id": prevMessage["messages"].length, "sentBy": user, "timeStamp": socket["handshake"]["time"].split("2019 ")[1].split(" ")[0], "message": msg})
      fs.writeFileSync('messages.json', JSON.stringify([prevMessage]));
    });
    for (let loop = 0;loop < userList.length;loop++) {
      if (loop == 0) {
        io.emit('clear online');
      }
      io.emit('display online', userList[loop]);
    }
    socket.on('disconnect', function(){
      console.log(`user disconnected`);
      if (userList.indexOf(user) > -1) {
        userList.splice(userList.indexOf(user), 1);
      };
      for (let loop = 0;loop < userList.length;loop++) {
        if (loop == 0) {
          io.emit('clear online');
        }
        io.emit('display online', userList[loop]);
      }
    });
    console.log(userList)
  });

  socket.on('display online', function(username){
    io.emit('display online', username);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
