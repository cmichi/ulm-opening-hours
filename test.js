// Goal of this file is to output open shops as a JSON
// with corresponding Geolocations.

/*
var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./xapi_meta.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc)


// output everything which has open now

console.log(nodes[0].toString())

var new_doc = new dom().parseFromString( nodes[0].toString() );
var obj = {
	lat : xpath.select("//node/@lat", new_doc)[0].value
	, lon : xpath.select("//node/@lon", new_doc)[0].value
	, name : xpath.select("//tag[@k='name']/@v", new_doc)[0].value
	, opening_hours: xpath.select("//tag[@k='opening_hours']/@v", new_doc)[0].value
};
console.log(JSON.stringify(obj));
*/

// parse opening hours
// input: Mo-Fr 7:00-13:00, 14:30-18:30; Sa 7:00-13:00
// input: Mo, Th 8:30-13:30, 14:45-18:00; Tu, Fr 8:30-13:30, 14:45-17:00; We 8:30-12:30
// output: { { Mo: {from: (24 + 8 + 30), to: (24 + 13 + 30) }, Th: ... }
// for every day there has to be a key!
// count from Sunday
// var foo = obj.opening_hours;

var foo = "Mo, Th 8:30-13:30, 14:45-18:00; Tu, Fr 8:30-13:30, 14:45-17:00; We 8:30-12:30"
var entries = foo.split(/;/);
for (var index in entries) {
	var entry = entries[index].trim();
	// extract until first digit
	console.log(entry);
	var days = entry.match(/[A-z]+[,\s]?/g); // char followed by , or \s
	var times = entry.match(/\d+[:]+\d+/g); // every timestamp in string
	var output = {};

	for (var i in days) {
		day = days[i].trim().replace("," , "");
		console.log(day)
		var count = 0;
		var label = "from";
		var open_hour = {};

		for (var i in times) {
			if (output[day] === undefined) 
				output[day] = [];

			open_hour[label] = convert(day, times[i]);

			if (label === "from") {
				label = "to";
			} else {
				label = "from";
				output[day].push(open_hour);
				open_hour = {};
			}
			//console.log(times[i])
		}
	}

	console.log( JSON.stringify( output ) );


	console.log("")
}


function convert(day, time) {
	// convert time Mo, 8:30 = (24 + 8 + 30)
	// console.log(day + ", " + time)
	var matches = time.match(/\d+/g);
	var hours = parseInt(matches[0]);

	if (matches.length > 1 && matches[1] != undefined)
		var mins = parseInt(matches[1]);
	else 
		var mins = 0;

	var arr = {"Su" : 0, "Mo" : 1, "Tu" : 2, "We" : 3, "Th" : 4, 
			"Fr" : 5, "Sa" : 6};

	//return (arr[day] * 24) + hours + mins;
	return (60*hours) + mins;
}
