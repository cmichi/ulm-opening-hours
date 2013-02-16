var fs = require('fs');
var express = require('express');
var io = require('socket.io');

var app = express();
var server = require('http').createServer(app);
io = io.listen(server);

var opening_hours = require('./opening_hours.js');


app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());


var data = fs.readFileSync("./data/xapi_meta.json");
data = JSON.parse(data);

// parse for currently open locations
//var open_entities = [];

var test = false;

function generateOpenEntities(date) {
	//date = ...

	if (test == true) {
		test = false;
		//date = ...
	} else 
		test = true

	var open_entities = [];
	for (var i in data) {
		//console.log(data[i].original_opening_hours);
		var oh = new opening_hours(data[i].original_opening_hours);
		var is_open = oh.getState(date);

		var diff = 15;
		var soon = new Date(date.getTime() + diff*60000);
		data[i].closing_soon = !oh.getState(soon);

		if (is_open) {
			open_entities.push(data[i]);
		}
	}
	//console.log(JSON.stringify(open_entities));
	return open_entities;
}

//var now = new Date();
//generateOpenEntities((now.getHours()*60 + now.getMinutes()), now.getDay());

io.sockets.on('connection', function (socket) {
	//io.sockets.emit('initialisation', generateOpenEntities(new Date()));
	//sendTime(); // initial call

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
