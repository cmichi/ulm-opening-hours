var map;
var entity_groups = [];
var tile_groups = [];
var info, ctrls, legend;
var initialized = false;
var prefs = {};
var prefs_dropped = {};
var socket;
var now = new Date();

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';

// how often does the client pull new opening times?
var updateFrequency = 1000 * 60; // each minute

var dialog_opt = {
	resizable: false
	, width: 550
	, modal: true
}


document.addEventListener('DOMContentLoaded', function() {
	$("#datepicker").datetimepicker({
		dateFormat: 'dd.mm.yy'
		, firstDay: 0
		, monthNames: ["Januar", "Februar", "März", "April", "Mai",
						"Juni", "Juli", "August", "September", 
						"Oktober", "November", "Dezember"]
		, monthNamesShort: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun",
							"Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
		, dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", 
					 "Donnerstag", "Freitag", "Samstag"]
					, dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
					, dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
					, timeText: 'Zeit'
					, hourText: 'Stunde'
					, minuteText: 'Minute'
					, secondText: 'Sekunde'
	});
	$("#datepicker").datetimepicker('setDate', now);
	//$(".ui-datepicker-buttonpane .ui-datepicker-close").remove();
	$(".ui-datepicker-buttonpane").css({'display': 'none'});
	/*
	$("#ui-datepicker-div").click(function() {
		console.log('cl')
		addBtns();		
	})
	*/
//	addBtns();
	
	map = L.map('map', {
		center: new L.LatLng(48.40783887047417, 9.987516403198242)
		, zoom: 14
		, layers: tile_groups
	});
	L.tileLayer(cloudmadeUrl, {attribution: cloudmadeAttribution}).addTo(map);

	legend = L.control();
	legend.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'legend leaflet-control '
			+ 'leaflet-control-layers leaflet-control-layers-expanded');
		this._div.innerHTML += "<img class='icon1' height='30' src='/img/marker-icon-green.png' />"
		this._div.innerHTML += "<div class='label1'>Ge&ouml;ffnet</div>"

		this._div.innerHTML += "<div class='label2'>Weniger als <br />15 Min ge&ouml;ffnet</div>"
		this._div.innerHTML += "<img class='icon2' height='30' src='/img/marker-icon-yellow.png' />"
		
		L.DomEvent.disableClickPropagation(this._div);
		L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);
		
		return this._div;
	};

	socket = io.connect('/');
	socket.on('connection', function() {
		pullNewEntries();
		setInterval(pullNewEntries, updateFrequency);
	})

	socket.on('receiveOpenEntities', function (open_entities) {    
		if (initialized) {
			// everything has been initialized once before and
			// has to be reset now. the gui is recreated on
			// each fetch. hence we don't need to delete/add
			// certain new markers, but instead delete all and
			// add the whole newly received batch.
			map.removeControl(info);
			map.removeControl(legend);
			entity_groups = [];

			savePreferences();
			map.removeControl(ctrls);
			
			for (var i in tile_groups) 
				tile_groups[i].clearLayers();
			tile_groups = [];
		}


		// create a marker for each entity 
		for (var i in open_entities) {
			entity = open_entities[i];

			if (entity_groups[entity.category] == undefined) {
				entity_groups[entity.category] = [];
				tile_groups[entity.category] = [];
			}

			var category_label = entity.category;
			if (translate[entity.category] != undefined) 
				category_label = translate[entity.category];

			entity_groups[entity.category].push( 
				L.marker(
					[entity.lat, entity.lon], {icon: getIcon(entity)}).bindPopup(
						"<strong>" + entity.name + "</strong>"
						+ "<br />Kategorie: " + category_label + "<br />"
						+ "<br />" + entity.original_opening_hours.split(';').join('<br />')
					)
			);
		}

		// markers are grouped within groups (e.g. supermarket)
		for (var i in entity_groups) {
			tile_groups[i] = L.layerGroup(entity_groups[i]);
		}

		info = L.control();
		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'leaflet-control '
				+ 'leaflet-control-layers leaflet-control-layers-expanded');
			this.update();
			
			L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.disableClickPropagation(this._div);
			
			return this._div;
		};
		info.update = function (props) {
			this._div.innerHTML = "<h4 class='appdesc'>ulm<br />" 
				+ 'Was hat ge&ouml;ffnet?</h4><h4>'
				+ '<span id="time"></span>';

			if (open_entities.length === 0) {
				this._div.innerHTML += '<br /><h4>Aktuell hat leider \
				nichts ge&ouml;ffnnet!</h4>';
			}
		};
		info.addTo(map);
		updateTime(0);

		legend.addTo(map);

		ctrls = buildCtrls();
		ctrls.addTo(map);

		restorePreferences();

		if (!initialized) {
			setInterval(updateTime, updateFrequency);
			clearInterval(sw_interval);
			$("#loading_box").css({'display': 'none'});
			$("#loading").css({'display': 'none'});
			
			initialized = true;
		}
	});
}, false);


function buildCtrls() {
	ctrls = L.control();
	ctrls.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'ctrls leaflet-control \
				leaflet-control-layers leaflet-control-layers-expanded'); 
				
		L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);
		L.DomEvent.disableClickPropagation(this._div);

		var cnt = "";

		var groups_cnt = {};
		groups_cnt[others] = [];

		for (var i in tile_groups) {
			var label = "";
			if (translate[i] != undefined) 
				label = translate[i];
			else
				label = i;

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
					groups_cnt[groups[i]] = [];

				groups_cnt[ groups[i] ].push(newcnt);
			} else {
				groups_cnt[ others ].push(newcnt);
			}

		}

		var others_cnt;

		for (var i in groups_cnt) {
			var count = groups_cnt[i].length;

			var style = '';
			if (prefs_dropped[i] != undefined && prefs_dropped[i]) 
				style = "style='display:block'";

			var cnt2 = "<div><div class='dropheader'>"
			+ "<div class='plus' onclick='toggle_drop(this);'>+</div>"
			+ "<a href='#' onclick='toggle_drop(this);'>" + i 
			+ "</a>"
			+ "<a href='#' onclick='toggle_drop(this);'>" 
			+ " (" + count + ")</a>"
			+ "<img src='/img/arrow-left.png' alt='' onclick='toggle_drop(this);'"
			+ " class='arrow' /></div>"
			+ "<div class='dropbox' " + style + " id='drop'>" + groups_cnt[i].join('')
			+ "</div></div>"

			if (i !== others) cnt += cnt2;
			else others_cnt = cnt2;
		}

		cnt += others_cnt; // last item
		cnt += "<div class='bottom'><a "
			+ "href='javascript:toggle_all(true);'>Alle anzeigen</a>"
			+ "&nbsp;|&nbsp;"
			+ "<a href='javascript:toggle_all(false);'>Keine anzeigen</a>"
			+ "<br /><a href='javascript:dialog();'>&Uuml;ber dieses Projekt</a>"
			+ "</div>";

		this._div.innerHTML = cnt;

		return this._div;
	};

	return ctrls;
}


function getIcon(entity) {
	if (entity.closing_soon) 
		var iconUri = "/img/marker-icon-yellow.png";
	else
		var iconUri = "/img/marker-icon-green.png";

	return L.icon({
		iconUrl : iconUri
		, iconSize: new L.Point(26, 41)
		, iconAnchor: new L.Point(12, 41)
		, popupAnchor: new L.Point(1, -34)

		//shadowSize: new L.Point(41, 41),
		//shadowAnchor: [12, 41],
		//shadowUrl : "/img/marker-shadow.png"
	});
}


function savePreferences() {
	$(".ctrls input[type=checkbox]").each(function(){
		prefs[this.name] = this.checked;
	});
}


function restorePreferences() {
	$(".ctrls input[type=checkbox]").each(function(){
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
}


function pullNewEntries() {
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

	var edit_btn = "<img src='/img/edit.png' class='edit' "
		+ "alt='Bearbeiten' title='Dargestellten Zeitpunkt ändern' "
		+ "onclick='javascript:toggle_picker();' "
		+ "onmouseout='picker_mouse(false)' "
		+ "onmouseover='picker_mouse(true)' />"

	time.mins = (time.mins < 10) ? ("0" + time.mins.toString()) : time.mins;
	time.hours = (time.hours < 10) ? ("0" + time.hours.toString()) : time.hours;
	time.secs = (time.secs < 10) ? ("0" + time.secs.toString()) : time.secs;

	$('#time').html("<div class='time'>"
		+ "<strong >" + days[time.day] + ", " 
		+ now.getDate() + "." 
		+ now.getMonth() + "." 
		+ now.getFullYear() 
		+ "<br />"
		+ time.hours + ":" + time.mins + edit_btn  + "</strong></div>");
		
//	$(".edit").click(function(e) {
//	});
	
	$("#ui-datepicker-div").html()
}


function toggle(el) {
	if (el.checked === false) {
		map.removeLayer(tile_groups[el.name]);
	} else {
		map.addLayer(tile_groups[el.name]);
	}
}


function toggle_drop(here) {
	if ($(here).parent().parent().find(".dropbox").css('display') === "none") {
		prefs_dropped[here.innerHTML] = true;
		$(here).parent().parent().find("img").attr("src", "/img/arrow-down.png");
		$(here).parent().parent().find(".plus").text("-");
	} else {
		prefs_dropped[here.innerHTML] = false;
		$(here).parent().parent().find("img").attr("src", "/img/arrow-left.png");
		$(here).parent().parent().find(".plus").text("+");
	}

	$(here).parent().parent().find(".dropbox").toggle("blind");
}


function dialog() {
	$("#datepicker").datetimepicker('setDate', now);
	$("#dialog-confirm").dialog(dialog_opt);
}


function submit() {
	now = $("#datepicker").datetimepicker('getDate');
   	//$("#datepicker").datetimepicker('setDate', d);
	
	//now = $("#datepicker").datetimepicker('getDate');
	pullNewEntries();
	//$("#dialog-confirm").dialog("close");
	toggle_picker();
}


var sw = true;
var sw_cnt = "";
function swap() {
	if (sw) {
		$("#spatz").css({'backgroundPosition': '-124px 0px'});
		sw = false;
	} else {
		$("#spatz").css({'backgroundPosition':'0px 0px'});
		sw = true;
	}
	
	$("#loading_box #label").text("Loading" + sw_cnt);
	sw_cnt += ".";
	if (sw_cnt.length == 4) sw_cnt = ".";
}
var sw_interval = setInterval("swap()", 500);

var picker = false;
function picker_mouse(v) {
	if (v === false && picker === true)
		$(".edit").attr('src', './img/edit-hover.png');	
	else if (v === false && picker === false)
		$(".edit").attr('src', './img/edit.png');	
	else if (v === true && picker === false) 
		$(".edit").attr('src', './img/edit-hover.png');	
	else if (v === true && picker === true) 
		$(".edit").attr('src', './img/edit-hover.png');	
}

function toggle_picker(evnt) {
	if (picker === false) {
		$("#ui-datepicker-div").css({'display': 'block'});
		picker = true;
	} else {
		$("#ui-datepicker-div").css({'display': 'none'});		
		picker = false;
	}
}

function addBtns() {
	if (!$("#ui-datepicker-div #ctrlbtns").length > 0) {
		$(
			'<div id="ctrlbtns">'
			+ '<button onclick="submit()" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" type="button">Einstellen</button>'
			+ '<button onclick="setNow()" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" type="button">Aktuelle Zeit</button>'
			+ '</div>'
		).appendTo('#ui-datepicker-div');
	}
}

function setNow() {
   	$("#datepicker").datetimepicker('setDate', new Date());
}