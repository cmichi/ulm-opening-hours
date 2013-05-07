var fs = require('fs');
var express = require('express');
var opening_hours = require('./lib/opening_hours.js');

var xmlParser = require('./data/parse_xml.js')
var data = xmlParser.getData();
var parse_err_output = false;

var app = express();
app.get('/', function(req, res) {
console.log(req.query)
	var file = "/static/index.html";
	if ("_escaped_fragment_" in req.query) 
		file = "/static/ajax-snapshot.html";

	try {
		res.sendfile(__dirname + file);
	} catch(err) {
		res.send(404);
	}
});

app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());


var server = require('http').createServer(app);


function generateOpenEntities(date) {
	var open_entities = [];
	for (var i in data) {
		try {
			var oh = new opening_hours(data[i].opening_hours);
		} catch (err) {			
			/* only output error messages at the first time they are thrown.
			   otherwise our program will flood stdout on each /get_entries request */
			if (!parse_err_output) {
				console.log("error while parsing '" + data[i].opening_hours + "':");
				console.log(err);
				console.log(JSON.stringify(data[i]) + "\n");
			}
			continue;
		}
		
		var is_open = oh.getState(date);

		// still open in 15 minutes?
		var soon = new Date(date.getTime() + 15*60000);
		data[i].closing_soon = !oh.getState(soon);

		if (is_open) {
			open_entities.push(data[i]);
		}
	}
	parse_err_output = true;

	return open_entities;
}

app.get('/get_entries', function(req, res) {
	var now = new Date(parseInt(req.query.ms));
	res.send(generateOpenEntities(now));
});


server.listen(process.env.PORT || 3046, function() {
	console.log('Listening on port ' + server.address().port);
});
