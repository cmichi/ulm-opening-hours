var fs = require('fs');
var express = require('express');
var opening_hours = require('opening_hours');

var xmlParser = require('./data/parse_xml.js')
var data = xmlParser.getData();

// Get country and state name, needed by opening_hours.js for evaluation of holidays.
// For optimization, the nominatim object can also be predefined …
// Works on the assumption that the state is equal for all facilities in the data set!
// var url = 'http://nominatim.openstreetmap.org/reverse';
var url = 'http://open.mapquestapi.com/nominatim/v1/reverse.php';
url += '?format=json&osm_type=N&osm_id=' + data[0].id
    + '&zoom=5&addressdetails=1&email=ypid23@aol.de';
var url_lang_set = 'accept-language=';
var url_lang = 'de';

if (typeof nominatim == 'undefined') {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", url + '&' + url_lang_set + url_lang, false );      // true makes this call asynchronous
    xhr.onreadystatechange = function () {    // need eventhandler since our call is async
        if ( xhr.readyState == 4 && xhr.status == 200 ) {  // check for success
            nominatim = JSON.parse( xhr.responseText );
            console.log(JSON.stringify(nominatim, null, '\t'));
            if (nominatim.address.country_code != url_lang) {
                xhr.open( "GET", url + '&' + url_lang_set + nominatim.address.country_code, false );
                xhr.onreadystatechange = function () {
                    if ( xhr.readyState == 4 && xhr.status == 200 ) {  // check for success
                        nominatim = JSON.parse( xhr.responseText );
                    }
                    url_lang = nominatim.address.country_code;
                }
                xhr.send(null);
            }
        }
    };
    xhr.send(null);
}

var parse_err_output = false;

var app = express();
app.get('/', function(req, res) {
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
			var oh = new opening_hours(data[i].opening_hours, nominatim);
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

		var it = oh.getIterator(date);

		var is_open = it.getState();
		var unknown = it.getUnknown();

		// still open in 15 minutes?
		var soon = new Date(date.getTime() + 15*60000);
		data[i].closing_soon = false;
		if (it.advance() && it.getDate().getTime() < soon.getTime() && it.getStateString(true) != 'closed')
			data[i].closing_soon = true;

		data[i].unknown = unknown;
		if (is_open || unknown) {
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
