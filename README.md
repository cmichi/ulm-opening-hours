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
 * Test alternating between Mo, 900 and Do 2300

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


# Known bugs

 * once new content is fetched (~each minute), each popup is closed


# Libraries

 * [leaflet](https://github.com/Leaflet/Leaflet)
 * express
 * socket.io
 * [opening_hours.js](https://github.com/AMDmi3/opening_hours.js/)

# License

The database file `xapi_meta.xml` is fetched from the Open Street Map
databse. It is made available under the Open Database License:
http://opendatacommons.org/licenses/odbl/1.0/. Any rights in individual
contents of the database are licensed under the Database Contents License:
http://opendatacommons.org/licenses/dbcl/1.0/

The code is licensed under the MIT license:

	Copyright (c) 2013

		Michael Mueller <http://micha.elmueller.net/>

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



