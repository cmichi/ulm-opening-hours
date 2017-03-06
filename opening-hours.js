var fs = require('fs');
var express = require('express');
var opening_hours = require('opening_hours');

var xmlParser = require('./data/parse_xml.js')
var data = xmlParser.getData();



// https://nominatim.openstreetmap.org/reverse?format=json&lat=48.3984100&lon=9.9915500&zoom=5&addressdetails=1
var nominatim = {"place_id":"159221147","licence":"Data © OpenStreetMap contributors, ODbL 1.0.  http:\/\/www.openstreetmap.org\/copyright","osm_type":"relation","osm_id":"62611","lat":"48.6296972","lon":"9.1949534","display_name":"Baden-Württemberg, Germany","address":{"state":"Baden-Württemberg","country":"Germany","country_code":"de"},"boundingbox":["47.5324787","49.7912941","7.5117461","10.4955731"]}



/* get country and state name, needed by opening_hours.js for evaluation of holidays.
   works on the assumption that the state is equal for all facilities in the data set. */
/*
var url = 'http://open.mapquestapi.com/nominatim/v1/reverse.php'
    + '?format=json&osm_type=N&osm_id=' + data[0].id
    + '&zoom=5&addressdetails=1';
var url_lang_set = 'accept-language=';
var url_lang = 'de';
var nominatim;

if (typeof nominatim == undefined) {
    var xmlHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    var xhr = new xmlHttpRequest();
    xhr.open('GET', url + '&' + url_lang_set + url_lang, false);

    xhr.onreadystatechange = function () {
        if ( xhr.readyState === 4 && xhr.status === 200 ) {
            nominatim = JSON.parse( xhr.responseText );
            console.log(JSON.stringify(nominatim, null, '\t'));

            if (nominatim.address.country_code !== url_lang) {
                xhr.open('GET', url + '&' + url_lang_set + nominatim.address.country_code, false);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status === 200) {
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
*/

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

		/* still open in 15 minutes? */
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
