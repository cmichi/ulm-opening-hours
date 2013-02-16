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
var open_entities = [];

var test = false;

function generateOpenEntities(time, day) {
	//time = 10*60;
	day = 4;
	time = 23*60;

	day = 1;
	time = 16*60;

	if (test == true) {
		day = 1;
		test = false;
		time = 9* 60;
	} else 
		test = true

	//day = 5;
	//time = 1 * 60;
	//console.log(day);
	day = 1;
	time = 9*60;

	var date = new Date();

	open_entities = [];
	for (var i in data) {
		if (data[i].opening_hours == undefined)
			continue;

		if (data[i].opening_hours[day] == undefined)
			continue;

		for (var j in data[i].opening_hours[day]) {
			// {from : ..., to: ...}
			//var entry = data[i].opening_hours[day][j];
			// console.log(JSON.stringify(entry));

			console.log(data[i].original_opening_hours);
			var oh = new opening_hours(data[i].original_opening_hours);
			var is_open = oh.getState(date);

			var diff = 15;
			var soon = new Date(date.getTime() + diff*60000);
			data[i].closing_soon = !oh.getState(soon);

			if (is_open) {
				open_entities.push(data[i]);
			}

			/*
			if (entry.from <= time && entry.to >= time) {
				open_entities.push(data[i]);
			}
			*/
		}
	}
	console.log(JSON.stringify(open_entities));
}

var now = new Date();
generateOpenEntities((now.getHours()*60 + now.getMinutes()), now.getDay());

io.sockets.on('connection', function (socket) {
	io.sockets.emit('initialisation', open_entities);
	sendTime(); // initial call
});


sendTime = function() {
	var now = new Date();
	time = { hours: now.getHours(), mins: now.getMinutes(), 
		 day: now.getDay() };
	currTime = (now.getHours()*60 + now.getMinutes());
	generateOpenEntities(currTime, now.getDay());

	io.sockets.emit('time', time);
	io.sockets.emit('initialisation', open_entities);
	//io.sockets.emit('open_entities', open_entities);
}
//setInterval(sendTime, 10 * 1000);
setInterval(sendTime, 1000);
//setInterval(sendTime, 1000 * 60);


server.listen(3000, function() {
console.log('Listening on port 3000');
});
