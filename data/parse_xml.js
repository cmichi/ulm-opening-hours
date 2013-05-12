// Goal of this file is to output open shops as a JSON
// with corresponding Geolocations.

var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./data/data.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc);
var ways = xpath.select("//way", doc);
var relations = xpath.select("//relation", doc);

var results = [];

exports.getData = function() {
	console.log("Starting to parse data...");

	for (var i in nodes) {
	//break;
		var new_doc = new dom().parseFromString( nodes[i].toString() );
		var obj = getObj(new_doc);

		if (obj != undefined) {
			results.push(obj);
		}
	}

	for (var i in ways) {
	//break;
		var way_doc = new dom().parseFromString( ways[i].toString() );
		var obj = parseWay(way_doc);

		if (obj != undefined && obj.name != undefined &&
		    obj.opening_hours != undefined) {
			results.push(obj);
		}

	}

	for (var i in relations) {
		var relation_doc = new dom().parseFromString( relations[i].toString() );
		var relation_way = xpath.select("//member[@type='way']/@ref", relation_doc);

		for (var n = 0; n < relation_way.length; n++) {
			var ref_nid = relation_way[n].value
			var nd = xpath.select("//way[@id=" + ref_nid + "]", doc);

			if (nd.toString() != "") {
				var way_doc = new dom().parseFromString( nd.toString() );
				var obj = parseWay(way_doc);

				if (obj != undefined && obj.name != undefined &&
				    obj.opening_hours != undefined) {
					results.push(obj);
				}
			}
		}
	}

	console.log("Parsed " + results.length + " facilities with opening_hours");
	return results;
}

function parseWay(way_doc) {
	var xml_id = xpath.select("//way/@id", way_doc);

	/* problem:  lat/lon is missing.
	   solution: search the first referenced node and get it */
	var ref_nodes = xpath.select("//nd/@ref", way_doc);
	if (ref_nodes == undefined || ref_nodes.length === 0) 
		return undefined;

	var j = 0;
	while (j < ref_nodes.length) {
		var ref_nid = ref_nodes[j].value;
		var ref_node_lat = xpath.select("//node[@id=" + ref_nid + "]/@lat", doc);
		var ref_node_lon = xpath.select("//node[@id=" + ref_nid + "]/@lon", doc);

		var lat = ref_node_lat[0].value;
		var lon = ref_node_lon[0].value;

		/* attach to obj */
		var new_way = way_doc.toString();
		new_way = new_way.replace("<way ", "<node " + 'lat="' + lat + '"' + ' lon="' + lon + '" ');
		new_way = new_way.replace("</way>", "</node>");
		
		var _new_doc = new dom().parseFromString(new_way);
		var obj = getObj(_new_doc);

		if (obj != undefined && obj.name != undefined &&
		    obj.opening_hours != undefined) {
			return obj;
			break;
		}

		j++;
	}
}


function getObj(new_doc) {
	var xml_opening_hours = xpath.select("//tag[@k='opening_hours']/@v", new_doc);
	if (xml_opening_hours == undefined || xml_opening_hours.length === 0) 
		return undefined;

	var xml_name = xpath.select("//tag[@k='name']/@v", new_doc);
	if (xml_name == undefined || xml_name.length === 0) 
		xml_name = xpath.select("//node/@id", new_doc);

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

	var xml_id = xpath.select("//node/@id", new_doc);
	if (xml_id == undefined || xml_id.length === 0) 
		xml_id = undefined;

	var xml_category = "other"; //xml_name[0].value;
	if (xml_shop !== undefined) xml_category = xml_shop[0].value;
	if (xml_tourism !== undefined) xml_category = xml_tourism[0].value;
	if (xml_office !== undefined) xml_category = xml_office[0].value;
	if (xml_craft !== undefined) xml_category = xml_craft[0].value;
	if (xml_amenity !== undefined) xml_category = xml_amenity[0].value;
	if (xml_id !== undefined) xml_id = xml_id[0].value;

	var obj = {
		lat : xpath.select("//node/@lat", new_doc)[0].value
		, lon : xpath.select("//node/@lon", new_doc)[0].value
		, name : xml_name[0].value
		, opening_hours: xml_opening_hours[0].value
		, category: "" + xml_category
		, id: xml_id
	};

	return obj;
}

