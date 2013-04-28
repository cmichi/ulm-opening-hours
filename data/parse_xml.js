// Goal of this file is to output open shops as a JSON
// with corresponding Geolocations.

var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./data/data.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc)
var results = [];


exports.getData = function() {
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

		var xml_tourism = xpath.select("//tag[@k='tourism']/@v", new_doc);
		if (xml_tourism == undefined || xml_tourism.length === 0) 
			xml_tourism = undefined;

		var xml_office = xpath.select("//tag[@k='office']/@v", new_doc);
		if (xml_office == undefined || xml_office.length === 0) 
			xml_office = undefined;

		var xml_craft = xpath.select("//tag[@k='craft']/@v", new_doc);
		if (xml_craft == undefined || xml_craft.length === 0) 
			xml_craft = undefined;

		var xml_leisure = xpath.select("//tag[@k='leisure']/@v", new_doc);
		if (xml_leisure == undefined || xml_leisure.length === 0) 
			xml_leisure = undefined;


		var xml_category = "other"; //xml_name[0].value;
		if (xml_shop !== undefined) xml_category = xml_shop[0].value;
		if (xml_tourism !== undefined) xml_category = xml_tourism[0].value;
		if (xml_office !== undefined) xml_category = xml_office[0].value;
		if (xml_craft !== undefined) xml_category = xml_craft[0].value;
		if (xml_amenity !== undefined) xml_category = xml_amenity[0].value;


		var obj = {
			lat : xpath.select("//node/@lat", new_doc)[0].value
			, lon : xpath.select("//node/@lon", new_doc)[0].value
			, name : xml_name[0].value
			, opening_hours: xml_opening_hours[0].value
			, category: "" + xml_category
		};


		results.push(obj);
		//console.log(JSON.stringify(obj));
	}
	return results;
}
