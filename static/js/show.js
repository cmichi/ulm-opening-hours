var map;
var entity_groups = [];
var tile_groups = [];
var info, myctrls, legend;
var init = false;
var prefs = {};
var prefs_dropped = {};
var currTime;

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';

var now = new Date();
//now = new Date(1360771200 - 8*60*60*1000);
//now.setYear(2013)
var updateFrequency = 1000 * 20;

var translate = {
	"supermarket": "Supermarkt"
	, "bank": "Bank"
	, "cafe": "Cafe"
	, "bar": "Bar"
	, "car_repair": "Autowerkstatt"
	, "optician": "Optiker"
	, "hairdresser": "Friseur"
	, "shop": "Einkaufsladen"
	, "bakery": "B&auml;cker"
	, "travel_agency": "Reiseb&uuml;ro"
	, "restaurant": "Restaurant"
	, "fuel": "Tankstelle"
	, "doctors": "&Auml;rzte"
	, "restaurant": "Restaurant"
	, "pharmacy": "Apotheke"
	, "butcher": "Metzgerei"
	, "library": "Bibliothek"
	, "atm": "Bankautomat"
	, "police": "Polizei"
	, "fast_food": "Schnellimbiss"
	, "tailor": "Schneiderei"
	, "computer": "Computer"
	, "hotel": "Hotel"
	, "dancing_school": "Tanzschule"
}
var food = "Ernährung"
var med = "Gesundheit"
var buy = "Einkaufen"
var others = "Sonstige"
var groups = {
	 "restaurant": 	food
	, "supermarket": buy
	, "bar": food
	, "butcher": food
	, "cafe": food
	, "shop": buy
	, "pharmacy": med
	, "doctors": med
	, "bakery": food
	, "fast_food": food
	, "computer": buy
}

var socket;

		var dialog_opt = {
			resizable: false,
			//height: 140,
			width: 600,
			modal: true,
			/*
			buttons: {
				Close: function() {
					$( this ).dialog( "close" );
				}
			}
			*/
		}

function foob() {
	$("#datepicker").datetimepicker('setDate', now)
	$("#dialog-confirm").dialog(dialog_opt);
}

function submit() {
	now = $("#datepicker").datetimepicker('getDate')
	getTime()
	$("#dialog-confirm").dialog("close");
}

function foo() {
	$(function() {
		$( "#datepicker" ).datetimepicker({dateFormat: 'dd.mm.yy', firstDay: 0 });
		$("#datepicker").datetimepicker('setDate', now)
		//$( "#dialog-confirm" ).dialog(dialog_opt);
	});
}

document.addEventListener('DOMContentLoaded', function() {
	foo();
	socket = io.connect('http://localhost');

	socket.on('connection', function() {
		getTime();
		setInterval(getTime, updateFrequency);
	})

	socket.on('initialisation', function (open_entities) {    
		if (init) {
			// everything has been initialized once before
			for (var i in tile_groups) tile_groups[i].clearLayers();
			map.removeControl(info);
			map.removeControl(legend);
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
				var iconUri = "/img/marker-icon-yellow.png"
			else
				var iconUri = "/img/marker-icon-green.png"

			var myIcon = L.icon({
				iconUrl : iconUri,
				iconSize: new L.Point(26, 41),
				iconAnchor: new L.Point(12, 41),
				popupAnchor: new L.Point(1, -34),

				shadowSize: new L.Point(41, 41),
				shadowAnchor: [12, 41],
				shadowUrl : "/img/marker-shadow.png"
			});

			//console.log(entity)
			var trans = entity.category;
			if (translate[entity.category] != undefined) 
				trans = translate[entity.category];

			entity_groups[entity.category].push( 
				L.marker(
					[entity.lat, entity.lon], {icon: myIcon}).bindPopup(
					"<strong>" + entity.name + "</strong>"
					+ "<br />Kategorie: " + trans + "<br />"
					+ "<br />" + entity.original_opening_hours.split(';').join('<br />')
					)
			);
		}

		for (var i in entity_groups) {
			tile_groups[i] = L.layerGroup(entity_groups[i]);
		}

		if (!init) {
			map = L.map('map', {
				//center: new L.LatLng(48.398949765641404, 9.981164932250977)
				center: new L.LatLng(48.40783887047417, 9.987516403198242)
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
			this._div.innerHTML = "<h4 style='line-height:1.2em;'>ulm<br />" 
			+ 'Was hat ge&ouml;ffnet?</h4><h4>\
			<span id="time"></span>';
			if (open_entities.length == 0) {
				this._div.innerHTML += '<br /><h4>Aktuell hat leider \
				nichts ge&ouml;ffnnet!</h4>';
			}
			L.DomEvent.disableClickPropagation(this._div);
		};
		info.addTo(map);
		updateTime(0);

		myctrls = L.control();
		myctrls.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'myctrls leaflet-control \
					leaflet-control-layers leaflet-control-layers-expanded'); 
			L.DomEvent.disableClickPropagation(this._div);

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

				if (groups[i] != undefined) {
					if (groups_cnt[ groups[i] ] == undefined) 
						groups_cnt[groups[i]] = []

					//groups_cnt[ groups[i] ] = []
					groups_cnt[ groups[i] ].push(newcnt);
				} else {
					groups_cnt[ others ].push(newcnt);
				}


			}

			var others_cnt;

			for (var i in groups_cnt) {
				var count = groups_cnt[i].length;
				//var cnt = 1;

				var style = '';
				if (prefs_dropped[i] != undefined && prefs_dropped[i]) 
					style = "style='display:block'"


				var cnt2 = "<div><div class='dropheader'>"
				+ "<div class='plus'>+</div>"
				+ "<a href='#' onclick='toggle_drop(this);'>" + i 
				+ "</a>"
				+ "<a href='#' onclick='toggle_drop(this);'>" 
				+ " (" + count + ")</a>"
				+ "<img src='/img/arrow-left.png' alt='' onclick='toggle_drop(this);'"
				+ " class='arrow' /></div>"
				//+ "<br />" 
				+ "<div class='dropbox' "+style+" id='drop'>" + groups_cnt[i].join('')
				+ "</div></div>"

				if (i !== others) cnt += cnt2;
				else others_cnt = cnt2;
			}

			cnt += others_cnt; // last item
			cnt += "<div class='all_ctrls'><a " +
				//"class='left' href='javascript:toggle_all(true);'>Alle</a>" +
				//"&nbsp;|&nbsp;" + 
				//"<a class='right' href='javascript:toggle_all(false);'>Keine</a></div>";

				"class='left' href='javascript:toggle_all(true);'>Alle sichtbar</a>" +
				"&nbsp;|&nbsp;" + 
				"<a class='right' href='javascript:toggle_all(false);'>Keine sichtbar</a>"
				+ "<br /><a href='javascript:foob();'>&Uuml;ber dieses Projekt</a>"
				+ "</div>";

			this._div.innerHTML = cnt;

			return this._div;
		};


		//if (!init) {
			legend = L.control();
			legend.onAdd = function (map) {
				this._div = L.DomUtil.create('div', 'leaflet-control '
					+ 'leaflet-control-layers leaflet-control-layers-expanded');
				this._div.innerHTML += "<img src='/img/marker-icon-green.png' height='30' style='float:left;margin-top:4px' />"
				this._div.innerHTML += "<div style='padding-top:10px;float:left;padding-left:5px '> Ge&ouml;ffnet</div>"

				this._div.innerHTML += "<div style='padding-top:0px;float:right;padding-left:5px;'>Weniger als <br />15 Min ge&ouml;ffnet</div>"
				this._div.innerHTML += "<img src='/img/marker-icon-yellow.png' height='30' style='float:right;margin-top:4px;' />"
				L.DomEvent.disableClickPropagation(this._div);
				return this._div;
			};
			legend.addTo(map);
		//}
		myctrls.addTo(map);


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

/*
	socket.on('time', function (time) {    
		currTime = time;
		updateTime(currTime);
	});
	*/
}, false);

function getTime() {
	//updateTime();
	//console.log(now.getTime())
	socket.emit('getEntries', {ms: now.getTime()})
}


function toggle_all(v) {
	for (i in tile_groups) {
		if (v && !map.hasLayer(tile_groups[i])) {
			map.addLayer(tile_groups[i]);
		} else if (!v) {
			map.removeLayer(tile_groups[i]);
		}
		$("input[name=" + i + "]").attr('checked', v)
		prefs[i] = v;
	}
}

function incTime() {
}

function updateTime(diff) {
	if (diff == undefined || diff == null)
		diff = updateFrequency;

	//console.log('update')
	now = new Date(now.getTime() + diff);

	var days = { 0: "So", 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 
			5: "Fr", 6: "Sa"};

	var time = {
		mins: now.getMinutes()
		, hours: now.getHours()
		, day: now.getDay()
		, secs: now.getSeconds()
	}

	var datepicker = "<a href='javascript:foob();'><img src='/img/edit.png' alt='' style='width:22px;\
	margin-left:5px;margin-bottom:-4px' \
	onmouseout='this.src=\"/img/edit.png\"' \
	onmouseover='this.src=\"/img/edit-hover.png\"' /></a>"
	//+ "<input type='text' id='edit' name='edit' style='width:100px' />"
	var timepicker = datepicker
	datepicker = ""

	time.mins = (time.mins < 10) ? ("0" + time.mins.toString()) : time.mins;
	time.hours = (time.hours < 10) ? ("0" + time.hours.toString()) : time.hours;
	time.secs = (time.secs < 10) ? ("0" + time.secs.toString()) : time.secs;
	document.getElementById('time').innerHTML = 
		"<div style='text-align:right'>"
		+ "<strong >" + days[time.day] + ", " 
		+ now.getDate() + "." +
		+ now.getMonth() + "." +
		now.getFullYear() + datepicker + "<br />"
		+ time.hours + ":" + time.mins + timepicker  + "</strong></div>";
		//+ '<br />(<a href="javascript:edit()">Edit</a>)</h4>';
		//"<strong>" + days[time.day] + ", " + time.hours + ":" + time.mins +":" + time.secs  + "</strong>";
	//$( "#date" ).datetimepicker();
}


function toggle(el) {
	if (el.checked === false) {
		map.removeLayer(tile_groups[el.name]);
	} else {
		map.addLayer(tile_groups[el.name]);
	}
}

function toggle_drop(here) {
	if ($( here ).parent().parent().find(".dropbox").css('display') === "none") {
		prefs_dropped[here.innerHTML] = true;
		$( here ).parent().parent().find("img").attr("src", "/img/arrow-down.png");
		$( here ).parent().parent().find(".plus").text("-");
	} else {
		prefs_dropped[here.innerHTML] = false;
		$( here ).parent().parent().find("img").attr("src", "/img/arrow-left.png");
		$( here ).parent().parent().find(".plus").text("+");
	}

	$( here ).parent().parent().find(".dropbox").toggle("blind")
}

