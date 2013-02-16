var map;
var overlayMaps;
var entity_groups = [];
var tile_groups = [];
var info, all_ctrls, myctrls;
var init = false;
var prefs = {};
var currTime;

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';


document.addEventListener('DOMContentLoaded', function() {

	var socket = io.connect('http://localhost');

	socket.on('initialisation', function (open_entities) {    
		if (init) {
			//es wurde alles schonmal initialisiert
			for (var i in tile_groups) tile_groups[i].clearLayers();
			map.removeControl(all_ctrls);
			map.removeControl(info);
			entity_groups = [];
			tile_groups = [];

			// save preferences 
			//console.log('init')
			$(".myctrls input[type=checkbox]").each(function(){
				//console.log(this.name + ": " + this.checked)
				prefs[this.name] = this.checked;
			});
			map.removeControl(myctrls);

			/*
			for (var i in ctrls._form) {
				if (ctrls._form[i] != undefined &&
				ctrls._form[i].parentNode != undefined)
					var name = ctrls._form[i].parentNode.children[1].innerHTML;
					//console.log(typeof name);
					if (name != undefined && typeof name == "string") {
						//console.log(name);
						name = name.trim().match(/[A-z0-9=\s"]+/);
						prefs[name] = ctrls._form[i].checked;
					}
			}
			*/
			//console.log(prefs)
		} else {
		}


		for (var i in open_entities) {
			entity = open_entities[i];

			if (entity_groups[entity.category] == undefined) {
				entity_groups[entity.category] = [];
				tile_groups[entity.category] = [];
			}

			var myURL = "marker-icon-green.png";
			if (entity.closing_soon) 
				myURL = "marker-icon.png"
				//myURL = "marker-icon-yellow.png"

			var myIcon = L.icon({
				iconUrl : myURL,
				iconSize: new L.Point(25, 41),
				iconAnchor: new L.Point(12, 41),
				popupAnchor: new L.Point(1, -34),

				shadowSize: new L.Point(41, 41),
				shadowAnchor: [12, 41],
				shadowUrl : "marker-shadow.png"
		        });

			entity_groups[entity.category].push( 
				L.marker(
					[entity.lat, entity.lon], {icon: myIcon}).bindPopup(
					entity.name
					+ "<br />" + entity.original_opening_hours
					+ "<br />" + JSON.stringify(entity.opening_hours)
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

		overlayMaps = {};
		for (var i in tile_groups) {
			if (translate[i] != undefined) {
				//overlayMaps[ translate[i] ] = tile_groups[i];
				overlayMaps[ translate[i] + " (" + entity_groups[i].length  + ")" ] = tile_groups[i];
				//console.log(i + " (" + entity_groups[i].length  + ")" + entity_groups[i] )
			} else {
				//overlayMaps[ i ] = tile_groups[i];
				overlayMaps[ i + " (" + entity_groups[i].length  + ")" ] = tile_groups[i];
				tile_groups[i].addTo(map);
			}
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
			Ulm | <span id="time"></span> (<a href="">Edit</a>)</h4>';
			if (open_entities.length == 0) {
				this._div.innerHTML += '<br /><h4>Aktuell hat leider \
				nichts ge&ouml;ffnnet!</h4>';
				//ctrls._container.style.display="none"
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

				//console.log(i + " (" + entity_groups[i].length  + ")" + entity_groups[i] )
				var newcnt = ""
				newcnt = "<label>"
				newcnt += "<input class='leaflet-control-layers-selector' "
						+ " type='checkbox' name='" + i + "' "
						+ " checked='checked' "
						+ " onclick='javascript:toggle(\""
						+ i + "\",this)' "
						+ " />"
				newcnt += "<span>" + label + " (" + entity_groups[i].length  + ")</span>" 
				newcnt += "</label>"
				//console.log(i + groups[i])
				if (groups[i] != undefined && groups_cnt[ groups[i] ] == undefined) {
					groups_cnt[ groups[i] ] = []
					groups_cnt[ groups[i] ].push(newcnt);
				} else {
					//groups_cnt[ others ] = []
					//console.log(others)
					groups_cnt[ others ].push(newcnt);
				}


				//console.log( translate[i] )
			}


			for (var i in groups_cnt)
				cnt += i + "<br />" + groups_cnt[i].join('')

			this._div.innerHTML = cnt;
			this.update();

			return this._div;
		};

		myctrls.update = function (props) {
			//console.log('update')
		};

		myctrls.addTo(map);

		all_ctrls = L.control();
		all_ctrls.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'leaflet-control '
				+ 'leaflet-control-layers leaflet-control-layers-expanded');
			this.update();
			return this._div;
		};
		all_ctrls.update = function (props) {
			this._div.innerHTML = "<div class='all_ctrls'><a href='javascript:all(true);'>Alle aktivieren</a>" +
				"&nbsp;|&nbsp;" + 
				"<a href='javascript:all(false);'>Alle deaktivieren</a></div>";
		};
		all_ctrls.addTo(map);


		// restore preferences
		console.log(JSON.stringify(prefs))
		$(".myctrls input[type=checkbox]").each(function(){
			console.log(this.name + ": " + this.checked)
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

		if (init) {

			/*
			for (var i in ctrls._form) {
				if (ctrls._form[i] != undefined &&
				  ctrls._form[i].parentNode != undefined) {
					var name = ctrls._form[i].parentNode.children[1].innerHTML;
					if (name != undefined && typeof name == "string") {
						name = name.trim().match(/[A-z0-9=\s"]+/);
						if (prefs[name] == undefined)
							ctrls._form[i].checked = true;
						else
							ctrls._form[i].checked = prefs[name];

					}
				}
			}
			ctrls._onInputClick();

			if (open_entities.length === 0) {
				ctrls._container.style.display="none"
			}
			ctrls._container.style.display="none"
			*/
		}
		init = true;
	});

	socket.on('time', function (time) {    
		currTime = time;
		updateTime(currTime);
	});

	socket.on('open_entities', function (time) {    
		// markers on map have to be updated

		// remove all of them

	});
}, false);


function all(v) {
	for (var i in ctrls._form) {
		if (ctrls._form[i] !== null && ctrls._form[i].type === "checkbox") {
			ctrls._form[i].checked = v;
		}
	}
	ctrls._onInputClick();
}

function updateTime(time) {
	if (time == undefined) return; 

	var days = { 0: "So", 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 
			5: "Fr", 6: "Sa"};

	var mins = (time.mins < 10) ? ("0" + time.mins.toString()) : time.mins;
	var hours = (time.hours < 10) ? ("0" + time.hours.toString()) : time.hours;
	document.getElementById('time').innerHTML = 
		"<strong>" + days[time.day] + ", " + hours + ":" + mins  + "</strong>";
}


var layers = {}
function toggle(label, el) {
	//console.log(label)
	if (el.checked === true)
		map.removeLayer(tile_groups[label]);
	else 
		map.addLayer(tile_groups[label]);
}
