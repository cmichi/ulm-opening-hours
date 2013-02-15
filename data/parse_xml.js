// Goal of this file is to output open shops as a JSON
// with corresponding Geolocations.

var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./xapi_meta.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc)
var results = [];

/*
console.log(
	JSON.stringify(
		//parseOpeningHours("Mo 08:00-12:00,16:00-19:00; Tu-We 08:00-12:00,16:00-18:00; Th 08:00-12:00,16:00-19:00; Fr 08:00-12:00")
		parseOpeningHours("Su-Th 06:00-01:00; Fr-Sa 06:00-02:00")
	)
)
*/

for (var i in nodes) {
	//console.log(nodes[i].toString())
	var new_doc = new dom().parseFromString( nodes[i].toString() );

	var xml_opening_hours = xpath.select("//tag[@k='opening_hours']/@v", new_doc);
	if (xml_opening_hours == undefined || xml_opening_hours.length === 0) 
		continue;

	var xml_name = xpath.select("//tag[@k='name']/@v", new_doc);
	if (xml_name == undefined || xml_name.length === 0) 
		xml_name = xpath.select("//node/@uid", new_doc);

	var xml_amenity = xpath.select("//tag[@k='amenity']/@v", new_doc);
	if (xml_amenity == undefined || xml_amenity.length === 0) 
		xml_amenity = undefined;

	var xml_shop = xpath.select("//tag[@k='shop']/@v", new_doc);
	if (xml_shop == undefined || xml_shop.length === 0) 
		xml_shop = undefined;

	var xml_category = xml_name;
	if (xml_shop !== undefined) xml_category = xml_shop[0].value;
	if (xml_amenity !== undefined) xml_category = xml_amenity[0].value;

	var obj = {
		lat : xpath.select("//node/@lat", new_doc)[0].value
		, lon : xpath.select("//node/@lon", new_doc)[0].value
		, name : xml_name[0].value
		, opening_hours: xml_opening_hours[0].value
		, original_opening_hours: xml_opening_hours[0].value
		, category: "" + xml_category
	};

	// var foo = "Mo, Th 8:30-13:30, 14:45-18:00; Tu, Fr 8:30-13:30, 14:45-17:00; We 8:30-12:30"
	obj.opening_hours = parseOpeningHours(obj.opening_hours);

	results.push(obj);
	//console.log(JSON.stringify(obj));
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

				/* special case: e.g.g 06:00 - 01:00, open
				   til next day */
				if (label === "to" && 
				    open_hour.to < open_hour.from) {
					// create two entries, the current
					// one goes til midnight, the new
					// one from midnight til closing time
					var midnight = convertTime(day, "24:00");
					output[day].push({from: midnight, to: open_hour.to});
					open_hour.to = midnight;
				}

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
	var hours = matches[0] * 1;

	if (matches.length > 1 && matches[1] != undefined)
		var mins = parseInt(matches[1]);
	else 
		var mins = 0;

	return (60*hours) + mins;
}

