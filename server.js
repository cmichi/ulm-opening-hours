var fs = require('fs');
var express = require('express');
var opening_hours = require('./lib/opening_hours.js');

var xmlParser = require('./data/parse_xml.js')
var data = xmlParser.getData()

var app = express();
app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());

var server = require('http').createServer(app);


function generateOpenEntities(date) {
	var open_entities = [];
	for (var i in data) {
		var oh = new opening_hours(data[i].original_opening_hours);
		var is_open = oh.getState(date);

		// still open in 15 minutes?
		var soon = new Date(date.getTime() + 15*60000);
		data[i].closing_soon = !oh.getState(soon);

		if (is_open) {
			open_entities.push(data[i]);
		}
	}

	return open_entities;
}

app.get('/get_entries', function(req, res) {
	var now = new Date(parseInt(req.query.ms));
	res.send(generateOpenEntities(now));
});


server.listen(process.env.PORT || 3000, function() {
	console.log('Listening on port ' + server.address().port);
});
