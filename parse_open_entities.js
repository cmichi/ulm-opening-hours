var fs = require('fs');

var data = fs.readFileSync("./data/xapi_meta.json");
data = JSON.parse(data);
//console.log(JSON.stringify(data[0]));

// parse for currently open locations
var currDay = 1;
var currTime = (16*60);
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

	// break;
}

console.log(JSON.stringify(open_entities));
