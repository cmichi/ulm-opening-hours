var fs = require('fs');
var express = require('express');
var io = require('socket.io');

var app = express();
var server = require('http').createServer(app);
io = io.listen(server);


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

	if (test == true) {
		day = 1;
		test = false;
		time = 9* 60;
	} else 
		test = true

	day = 5;
	time = 1 * 60;
	console.log(day);

	open_entities = [];
	for (var i in data) {
		if (data[i].opening_hours == undefined)
			continue;

		if (data[i].opening_hours[day] == undefined)
			continue;

		for (var j in data[i].opening_hours[day]) {
			// {from : ..., to: ...}
			var entry = data[i].opening_hours[day][j];
			// console.log(JSON.stringify(entry));

			if (entry.from <= time && entry.to >= time)
				open_entities.push(data[i]);
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
setInterval(sendTime, 3 * 1000);
//setInterval(sendTime, 1000);
//setInterval(sendTime, 1000 * 60);


server.listen(3000, function() {
console.log('Listening on port 3000');
});
