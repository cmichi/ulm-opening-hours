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
//var all = nodes.concat(way).concat(relation);
//all = nodes;

var results = [];

exports.getData = function() {
	for (var i in nodes) {
	break;
		var new_doc = new dom().parseFromString( nodes[i].toString() );
		var obj = getObj(new_doc);
		//console.log(nodes[i].toString())

		if (obj != undefined) {
			//console.log(JSON.stringify(obj));
			results.push(obj);
		}
	}

	for (var i in ways) {
		console.log("newway")
		var new_doc = new dom().parseFromString( ways[i].toString() );
		var xml_id = xpath.select("//way/@id", new_doc);
		//console.log(new_doc.toString())
		console.log(xml_id[0].value)

		/*
		var xml_opening_hours = xpath.select("//tag[@k='opening_hours']/@v", new_doc);
		if (xml_opening_hours == undefined || xml_opening_hours.length === 0) 
			continue;
		xml_opening_hours = xml_opening_hours[0].value;
		*/


		/* problem:  lat/lon is missing.
		   solution: search the first referenced node and get it */
		var ref_nodes = xpath.select("//nd/@ref", new_doc);
		if (ref_nodes == undefined || ref_nodes.length === 0) 
			continue;

		var i = 0;
		while (i < ref_nodes.length) {
			//console.log(i + " try to find ref node with lat/lon");
			//break;

			var ref_nid = ref_nodes[i].value;
			//console.log("id " + ref_nid);
			var ref_node_lat = xpath.select("//node[@id=" + ref_nid + "]/@lat", doc);
			var ref_node_lon = xpath.select("//node[@id=" + ref_nid + "]/@lon", doc);

			/*
			var ref_node = xpath.select("//node[@id=" + ref_nid + "]", doc);

			//console.log("length: " + ref_node.length)
			if (ref_node == undefined || ref_node.length === 0) 
				// try next one
				continue;

			//console.log("getting node for " + ref_nid)
			console.log(ref_node.toString())
			//console.log(ref_node)

			//var ref_doc = new dom().parseFromString( ref_node.toString() );
			var lat = xpath.select("/@lat", ref_node);
			//var lat = xpath.select("//node[@id=" + ref_nid + "]/@lat", ref_node);
			console.log(JSON.stringify(lat))
			return;
			var lon = xpath.select("//node[@id=" + ref_nid + "]/@lon", ref_node);

			if (lat == undefined || lat.length === 0 || 
			    lon == undefined || lon.length === 0) 
				continue;
			*/

			var lat = ref_node_lat[0].value;
			var lon = ref_node_lon[0].value;

			//console.log(lat)
			//return;

			/* attach to obj */
			var new_way = ways[i].toString();
			new_way = new_way.replace("<way ", "<node " + 'lat="' + lat + '"' + ' lon="' + lon + '" ');
			new_way = new_way.replace("</way>", "</node>")
			//console.log(new_way)
			new_doc = new dom().parseFromString(new_way);

			//console.log(new_doc.toString())
			//break;

			var obj = getObj(new_doc);
			//console.log("oh " + xml_opening_hours)
			//console.log("obj " + obj)

			if (obj != undefined) {
				//console.log("got it! ")
				console.log(obj.id + " " + obj.name)
				//console.log(JSON.stringify(obj));
				results.push(obj);
				break;
			} else {
				console.log("oh shit")
			}

			//console.log(JSON.stringify(obj));
			//results.push(obj);
			//break;

			//console.log("")
			i++;
		}
		//break;
	}

	console.log(results.length)
	//console.log(JSON.stringify(results));
	return results;
}


function getObj(new_doc) {
	//console.log(nodes[i].toString())

	var xml_opening_hours = xpath.select("//tag[@k='opening_hours']/@v", new_doc);
	if (xml_opening_hours == undefined || xml_opening_hours.length === 0) 
		return undefined;

	//if( xpath.select("//node/@id", new_doc)[0].value == ");
	//if (xml_opening_hours[0].value == "Mo-Fr 08:30-18:30; Sa 09:00-13:00; So off;")
		//console.log("got it")

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

