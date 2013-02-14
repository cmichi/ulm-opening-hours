var map;
var entity_groups = [];
var tile_groups = [];
var ctrls;

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';


document.addEventListener('DOMContentLoaded', function() {

	var socket = io.connect('http://localhost');

	socket.on('initialisation', function (open_entities) {    
		for (var i in open_entities) {
			entity = open_entities[i];

			if (entity_groups[entity.category] == undefined) {
				entity_groups[entity.category] = [];
				tile_groups[entity.category] = [];
			}



			entity_groups[entity.category].push( 
				L.marker(
					//[entity.lat, entity.lon]).addTo(map).bindPopup(
					[entity.lat, entity.lon]).bindPopup(
					entity.name
					+ "<br />" + entity.original_opening_hours
					+ "<br />" + entity.category
					)
			);
		}

		for (var i in entity_groups) {
			tile_groups[i] = L.layerGroup(entity_groups[i]);
		}


		//var tile_groups = L.tileLayer(cloudmadeUrl, {styleId: 22677, attribution: cloudmadeAttribution}),

		map = L.map('map', {
			center: new L.LatLng(48.400500, 9.9794349)
			, zoom: 14
			, layers: tile_groups
		});
		L.tileLayer(cloudmadeUrl, {attribution: cloudmadeAttribution}).addTo(map);

		var overlayMaps = {};
		for (var i in tile_groups) {
			overlayMaps[i] = tile_groups[i];
			tile_groups[i].addTo(map);
		}

		var ctrls = L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);


		var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	    return this._div;
	    };

	    info.update = function (props) {
		this._div.innerHTML = '<h4>Foobar</h4>' +
		(props ?
			'<b>' + props.name + '</b><br />' + props.density +
			' people / mi<sup>2</sup>'
				: 'Lorem Ipsum <input type="checkbox" name="foo" onclick="javascript:tile_groups[0].clearLayers()" /> ');
				};

				info.addTo(map);
	});

	socket.on('time', function (time) {    
		document.getElementById('time').innerHTML = 
			"<h1>Dargestellte Uhrzeit: " + time.hours + ":" + time.mins
			+ "</h1>";
	});




/*
	map = L.map('map').setView([48.400500,9.979434], 14);
	L.tileLayer('http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png'
	, {attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade'}).addTo(map);
	'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'}).addTo(map);
	*/

}, false);
