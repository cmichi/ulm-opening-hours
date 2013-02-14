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
var currDay = 1;
var currTime = (17*60 + 5);
var open_entities = [];

for (var i in data) {
	if (data[i].opening_hours == undefined)
		continue;

	if (data[i].opening_hours[currDay] == undefined)
		continue;

	for (var j in data[i].opening_hours[currDay]) {
		// {from : ..., to: ...}
		var entry = data[i].opening_hours[currDay][j];
		// console.log(JSON.stringify(entry));

		if (entry.from <= currTime && entry.to >= currTime)
			open_entities.push(data[i]);
	}
}

console.log(JSON.stringify(open_entities));


io.sockets.on('connection', function (socket) {
	/*
	io.sockets.emit('marker', {
		lon: 9.9456200
		, lat: 48.4143605
		, desc: "lorem ipsum"
	});
	*/

	io.sockets.emit('marker', open_entities);
});



server.listen(3000, function() {
  console.log('Listening on port 3000');
});
