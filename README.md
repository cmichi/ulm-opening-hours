# Ulm Opening Hours

**Project Status:** Heavily working on a prototype, but you should get
a working version when cloning this repository.

This is an idea which I had a while ago. I didn't get around to implement 
it but took the upcoming [Open Data Day](http://ulmapi.de/#opendataday)
as an opportunity to work on it.

The goal of this project is to create a website which can be used to answer
questions like *Which shops/bakeries/restaurants/etc. are still open?* or
*Where can I get beer at this time?*.

The data which is used will for now be exported from the OSM project.


# ToDo 

 * Create custom box for interactive category filtering
 * Markers in green, locations which close in < 15 min yellow
 * Make time editable
 * Remove need for external data.json, instead parse *.xml on startup
 * Datepicker

 * (What if we restart server? What happens to existing clients? Include a
   timeout within clientside JS which greys the website out if no reaction
   for 5 min)
 * (List open facilities near me?)


# Getting started

	$ git clone https://github.com/cmichi/ulm-opening-hours.git

	# install the necessary dependencies (express, socket.io) from the package.json
	$ npm install	

	$ node server.js

Then open [http://localhost:3000/](http://localhost:3000).


# Libraries

 * [leaflet](https://github.com/Leaflet/Leaflet)
 * express
 * socket.io
 * [opening_hours.js](https://github.com/AMDmi3/opening_hours.js/)


