var map;
var entity_groups = [];
var tile_groups = [];
var info, all_ctrls, myctrls;
var init = false;
var prefs = {};
var prefs_dropped = {};
var currTime;

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';

var now = new Date();
now = new Date();
//now = new Date(1360771200 - 8*60*60*1000);
//now.setYear(2013)
var updateFrequency = 1000 * 20;

var translate = {
	"supermarket": "Supermarkt"
	, "bank": "Bank"
	, "cafe": "Cafe"
	, "bar": "Bar"
	, "restaurant": "Restaurant"
	, "doctors": "&Auml;rzte"
	, "restaurant": "Restaurant"
	, "pharmacy": "Apotheke"
	, "fast_food": "Schnellimbiss"
}
var food = "Essen"
var med = "Medizin"
var others = "Sonstige"
var groups = {
	"supermarket": food
	, "restaurant": food
	, "pharmacy": med
	, "doctors": med
}

var socket;


document.addEventListener('DOMContentLoaded', function() {
	socket = io.connect('http://localhost');

	socket.on('connection', function() {
		getTime();
		setInterval(getTime, updateFrequency);
	})

	socket.on('initialisation', function (open_entities) {    
		if (init) {
			// everything has been initialized once before
			for (var i in tile_groups) tile_groups[i].clearLayers();
			//map.removeControl(all_ctrls);
			map.removeControl(info);
			entity_groups = [];
			tile_groups = [];

			// save preferences 
			$(".myctrls input[type=checkbox]").each(function(){
				prefs[this.name] = this.checked;
			});
			map.removeControl(myctrls);
		}


		for (var i in open_entities) {
			entity = open_entities[i];

			if (entity_groups[entity.category] == undefined) {
				entity_groups[entity.category] = [];
				tile_groups[entity.category] = [];
			}

			if (entity.closing_soon) 
				var iconUri = "marker-icon-yellow.png"
			else
				var iconUri = "marker-icon-green.png"

			var myIcon = L.icon({
				iconUrl : iconUri,
				iconSize: new L.Point(25, 41),
				iconAnchor: new L.Point(12, 41),
				popupAnchor: new L.Point(1, -34),

				shadowSize: new L.Point(41, 41),
				shadowAnchor: [12, 41],
				shadowUrl : "marker-shadow.png"
			});

			//console.log(entity)

			entity_groups[entity.category].push( 
				L.marker(
					[entity.lat, entity.lon], {icon: myIcon}).bindPopup(
					entity.name
					+ "<br />" + entity.original_opening_hours.split(';').join('<br />')
					+ "<br />" + entity.category
					)
			);
		}

		for (var i in entity_groups) {
			tile_groups[i] = L.layerGroup(entity_groups[i]);
		}

		if (!init) {
			map = L.map('map', {
				center: new L.LatLng(48.400500, 9.9794349)
				, zoom: 14
				, layers: tile_groups
			});
			L.tileLayer(cloudmadeUrl, {attribution: cloudmadeAttribution}).addTo(map);
		}

		info = L.control();
		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'leaflet-control '
				+ 'leaflet-control-layers leaflet-control-layers-expanded');
			this.update();
			return this._div;
		};
		info.update = function (props) {
			this._div.innerHTML = '<h4>Was hat ge&ouml;ffnet?<br />\
			Ulm | <span id="time"></span> (<a href="javascript:edit()">Edit</a>)</h4>';
			if (open_entities.length == 0) {
				this._div.innerHTML += '<br /><h4>Aktuell hat leider \
				nichts ge&ouml;ffnnet!</h4>';
			}
		};
		info.addTo(map);
		updateTime(currTime);

		myctrls = L.control();
		myctrls.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'myctrls leaflet-control \
					leaflet-control-layers leaflet-control-layers-expanded'); 
			var cnt = "";

			cnt = ''

			var groups_cnt = {};
			groups_cnt[others] = [];

			for (var i in tile_groups) {
				var label = "";
				if (translate[i] != undefined) 
					label = translate[i];
				else
					label = i;

				//console.log(i)

				var newcnt = ""
				newcnt = "<label>"
				newcnt += "<input class='leaflet-control-layers-selector' "
						+ " type='checkbox' name='" + i + "' "
						+ " checked='checked' "
						+ " onclick='javascript:toggle(this)' "
						+ " />"
				newcnt += "<span>" + label + " (" + entity_groups[i].length  + ")</span>" 
				newcnt += "</label>"

				if (groups[i] != undefined && groups_cnt[ groups[i] ] == undefined) {
					groups_cnt[ groups[i] ] = []
					groups_cnt[ groups[i] ].push(newcnt);
				} else {
					groups_cnt[ others ].push(newcnt);
				}


			}


			for (var i in groups_cnt) {
				var count = groups_cnt[i].length;
				//var cnt = 1;

				var style = '';
				if (prefs_dropped[i] != undefined && prefs_dropped[i]) 
					style = "style='display:block'"

				cnt += "<div><a href='#' onclick='toggle_drop(this);'>" + i 
				+ " (" + count + ")</a><br />" 
				+ "<div class='dropbox' "+style+" id='drop'>" + groups_cnt[i].join('')
				+ "</div></div>"
			}
			cnt += "<div class='all_ctrls'><a " +
			"class='left' href='javascript:toggle_all(true);'>Alle aktivieren</a>" +
				"&nbsp;|&nbsp;" + 
				"<a class='right' href='javascript:toggle_all(false);'>Alle deaktivieren</a></div>";

			this._div.innerHTML = cnt;

			return this._div;
		};

		myctrls.addTo(map);

/*
		all_ctrls = L.control();
		all_ctrls.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'leaflet-control '
				+ 'leaflet-control-layers leaflet-control-layers-expanded');
			this.update();
			return this._div;
		};
		all_ctrls.update = function (props) {
			this._div.innerHTML = "<div class='all_ctrls'><a " +
			"class='left' href='javascript:toggle_all(true);'>Alle aktivieren</a>" +
				"&nbsp;|&nbsp;" + 
				"<a class='right' href='javascript:toggle_all(false);'>Alle deaktivieren</a></div>";
		};
		all_ctrls.addTo(map);
		*/


		// restore preferences
		$(".myctrls input[type=checkbox]").each(function(){
			if (prefs != undefined && prefs[this.name] != undefined) {
				this.checked = prefs[this.name];
			} else {
				prefs[ this.name ] = true;
				this.checked = true;
			}
				

			if (prefs[this.name] === false) {
				map.removeLayer(tile_groups[this.name]);
			} else {
				map.addLayer(tile_groups[this.name]);
			}
		});

		if (!init) setInterval(updateTime, updateFrequency);
		init = true;
	});

	socket.on('foo', function (data) {    
		console.log(JSON.stringify(data))
	});

	socket.on('time', function (time) {    
		currTime = time;
		updateTime(currTime);
	});
}, false);

function getTime() {
	console.log(now.getTime())
	socket.emit('getEntries', {ms: now.getTime()})
}


function toggle_all(v) {
	for (i in tile_groups) {
		if (v && !map.hasLayer(tile_groups[i]))
			map.addLayer(tile_groups[i]);
		else if (!v)
			map.removeLayer(tile_groups[i]);
	}
}

function updateTime() {
	now = new Date(now.getTime() + updateFrequency);

	var days = { 0: "So", 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 
			5: "Fr", 6: "Sa"};

	var time = {
		mins: now.getMinutes()
		, hours: now.getHours()
		, day: now.getDay()
		, secs: now.getSeconds()
	}

	time.mins = (time.mins < 10) ? ("0" + time.mins.toString()) : time.mins;
	time.hours = (time.hours < 10) ? ("0" + time.hours.toString()) : time.hours;
	time.secs = (time.secs < 10) ? ("0" + time.secs.toString()) : time.secs;
	document.getElementById('time').innerHTML = 
		//"<strong>" + days[time.day] + ", " + time.hours + ":" + time.mins  + "</strong>";
		"<strong>" + days[time.day] + ", " + time.hours + ":" + time.mins
		+":" + time.secs  + "</strong>";
}


function toggle(el) {
	if (el.checked === false) {
		map.removeLayer(tile_groups[el.name]);
	} else {
		map.addLayer(tile_groups[el.name]);
	}
}

function toggle_drop(here) {
	if ($( here ).parent().find(".dropbox").css('display') === "none")
		prefs_dropped[here.innerHTML] = true;
	else
		prefs_dropped[here.innerHTML] = false;

	$( here ).parent().find(".dropbox").toggle("blind")
}

