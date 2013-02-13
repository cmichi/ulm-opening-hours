// Goal of this file is to output open shops as a JSON
// with corresponding Geolocations.

var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./xapi_meta.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc)
var results = [];

for (var i in nodes) {
	//var i = 4;
	//console.log(nodes[i].toString())

	var new_doc = new dom().parseFromString( nodes[i].toString() );

	var xml_opening_hours = xpath.select("//tag[@k='opening_hours']/@v", new_doc);
	if (xml_opening_hours == undefined || xml_opening_hours.length === 0) 
		continue;

	var xml_name = xpath.select("//tag[@k='name']/@v", new_doc);
	if (xml_name == undefined || xml_name.length === 0) 
		xml_name = xpath.select("//node/@uid", new_doc);

	var obj = {
		lat : xpath.select("//node/@lat", new_doc)[0].value
		, lon : xpath.select("//node/@lon", new_doc)[0].value
		, name : xml_name[0].value
		, opening_hours: xml_opening_hours[0].value
	};

	// var foo = "Mo, Th 8:30-13:30, 14:45-18:00; Tu, Fr 8:30-13:30, 14:45-17:00; We 8:30-12:30"
	obj.opening_hours = parseOpeningHours(obj.opening_hours);

	results.push(obj);
	//console.log(JSON.stringify(obj));
	//if (i == 4) break;
}

console.log(JSON.stringify(results));

function parseOpeningHours(foo) {
	var entries = foo.split(/;/);
	var output = {};
	for (var index in entries) {
		var entry = entries[index].trim();
		// extract until first digit
		//console.log(entry);
		var days = entry.match(/[A-z]+[,\s]?/g); // char followed by , or \s
		var times = entry.match(/\d+[:]+\d+/g); // every timestamp in string

		for (var i in days) {
			day = days[i].trim().replace("," , "");
			// now: "Mo" -> 0
			day = {"Su" : 0, "Mo" : 1, "Tu" : 2, "We" : 3, "Th" : 4, 
				"Fr" : 5, "Sa" : 6}[day];

			var count = 0;
			var label = "from";
			var open_hour = {};

			for (var i in times) {
				if (output[day] === undefined) 
					output[day] = [];

				open_hour[label] = convertTime(day, times[i]);

				if (label === "from") {
					label = "to";
				} else {
					label = "from";
					output[day].push(open_hour);
					open_hour = {};
				}
			}
		}
	}
	//console.log( JSON.stringify( output ) );
	//console.log("")

	return output;
}



// convertTime(1, 8:30) to (60*8 + 30)
function convertTime(day, time) {
	var matches = time.match(/\d+/g);
	var hours = parseInt(matches[0]);

	if (matches.length > 1 && matches[1] != undefined)
		var mins = parseInt(matches[1]);
	else 
		var mins = 0;

	return (60*hours) + mins;
}
