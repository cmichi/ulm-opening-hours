var express = require('express');
var io = require('socket.io');

var app = express();
var server = require('http').createServer(app);
io = io.listen(server);


app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());


io.sockets.on('connection', function (socket) {
	io.sockets.emit('marker', {
		lon: 9.9456200
		, lat: 48.4143605
		, desc: "lorem ipsum"
	});
});



server.listen(3000, function() {
  console.log('Listening on port 3000');
});
