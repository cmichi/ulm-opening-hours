# Ulm Opening Hours

This project creates a website which can be used to answer questions 
like *Which shops/bakeries/restaurants/etc. are still open?* or
*Where can I get beer at this time?*.

Often times when searching for websites of stores or other facilities,
people just look for the opening hours. This application offers a handy
interface which displays opening times for many locations in your city.

The data for this project is exported from the Open Street Map project on a
regular basis. 

A public instance of this project is hosted on 
[http://oeffnungszeiten.ulmApi.de](http://oeffnungszeiten.ulmApi.de).


# ToDo Code

 * Marker Popup: better formatting of opening_hours
 * Change "We off" in some popups to a better readable label


# ToDo OSM database

 * Add data for: 
  * Hostels, bakeries, local post station, clubs
  * Arbeitsamt und andere Öffentliche Einrichtungen (Bürgerbüro)
  * Parkhäuser, etc.
  * Schwörmontag Ausnahmen fuer Öffentliche Einrichtungen 
 * Add lecture-free-time opening hours for uni related stuff (cafe, bistro, etc.)


# Getting started

	$ git clone https://github.com/cmichi/ulm-opening-hours.git
	$ cd ulm-opening-hours/

	# install the necessary dependencies from the package.json
	$ npm install	
	$ node server.js

Then open [http://localhost:3046/](http://localhost:3046).


# Exporting fresh data from OSM

	$ ./data/export.sh > ./data/data.xml


# Adapting to a different city

 * Change the BoundingBox within `./data/export.sh` and adapt the map's
 center within the file `./static/js/show.js`.
 * Execute `$ ./data/export.sh > ./data/data.xml`.
 * Restart the server `$ node server.js` and the data should be displayed on [http://localhost:3046/](http://localhost:3046).


# Known bugs

 * Once new content is fetched (~each minute), each popup is closed. This
 is due to each marker being recreated on a new fetch. Also the scrollbars
 within the category selection are set to the beginning.


# Libraries & Icons

 * [opening_hours.js](https://github.com/AMDmi3/opening_hours.js/)
 * [leaflet](https://github.com/Leaflet/Leaflet)
 * express
 * jQuery and jQuery UI
 * [SimpleModal](https://github.com/ericmmartin/simplemodal)
 * [Check Icon](http://thenounproject.com/noun/check-mark/#icon-No2784) by P.J. Onori, from The Noun Project
 * [Edit Icon](http://thenounproject.com/noun/edit/#icon-No5587) by Naomi Atkinson, from The Noun Project
 * [GitHub Buttons](https://github.com/mdo/github-buttons)


# License

The database file `./data/data.xml` is exported from the Open Street Map
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



