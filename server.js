var fs = require('fs');
var express = require('express');
var io = require('socket.io');
var opening_hours = require('./lib/opening_hours.js');
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
		var now = new Date(data.ms);
		socket.emit('initialisation', generateOpenEntities(now))
	});
});


server.listen(3000, function() {
	console.log('Listening on port 3000');
});
