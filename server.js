var fs = require('fs');
var express = require('express');
var io = require('socket.io');
var opening_hours = require('./opening_hours.js');
var xmlParser = require('./data/parse_xml.js')
var data = xmlParser.getData()

var app = express();
app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());

var server = require('http').createServer(app);
io = io.listen(server);


function generateOpenEntities(date) {
	var open_entities = [];
	for (var i in data) {
		var oh = new opening_hours(data[i].original_opening_hours);
		var is_open = oh.getState(date);

		var diff = 15;
		var soon = new Date(date.getTime() + diff*60000);
		data[i].closing_soon = !oh.getState(soon);

		if (is_open) {
			open_entities.push(data[i]);
		}
	}

	return open_entities;
}


io.sockets.on('connection', function (socket) {
	socket.emit('connection');

	socket.on('getEntries', function (data){
		console.log(data)
		var now = new Date(data.ms);
		var h=now.getHours();
		var m=now.getMinutes();
		var s=now.getSeconds();

		console.log(h)
		console.log(m)
		console.log(s)
		console.log(now)

		socket.emit('initialisation', generateOpenEntities(now))
	});
});

/*
sendTime = function() {
	var now = new Date();
	time = { hours: now.getHours(), mins: now.getMinutes(), 
		 day: now.getDay() };
	currTime = (now.getHours()*60 + now.getMinutes());
	generateOpenEntities(currTime, now.getDay());

	//io.sockets.emit('time', time);
	io.sockets.emit('initialisation', open_entities);
	//io.sockets.emit('initialisation', open_entities);
	//io.sockets.emit('open_entities', open_entities);
}
*/
//setInterval(sendTime, 10 * 1000);
//setInterval(sendTime, 1000);
//setInterval(sendTime, 1000 * 60);


server.listen(3000, function() {
	console.log('Listening on port 3000');
});
