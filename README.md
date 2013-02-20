# Ulm Opening Hours

**Project Status:** Everyhting is working as expected.
The code is still messy and has to be refactored, also the UI has
to be optimized for mobile clients. This will be done as a next step.

The goal of this project is to create a website which can be used to answer
questions like *Which shops/bakeries/restaurants/etc. are still open?* or
*Where can I get beer at this time?*.

Often times when searching for websites of stores or other facilities,
people just look for the opening hours. This application offers a handy
interface which displays opening times for many locations in your city.

The data for this project is exported from the Open Street Map project on a
regular basis. 

Though I have been thinking about this idea for quite some time, it had to
take the upcoming [Open Data Day](http://ulmapi.de/#opendataday) as a
trigger for me to start working on it.


# ToDo 

 * Datepicker on page, not in modal dialog
 * Autompletion text field for fulltext search

 * Add data for: hostels, bakeries, local post stations


# Getting started

	$ git clone https://github.com/cmichi/ulm-opening-hours.git

	# install the necessary dependencies from the package.json
	$ npm install	

	$ node server.js

Then open [http://localhost:3000/](http://localhost:3000).


# Exporting fresh data from OSM

	$ ./data/export.sh > ./data/data.xml


# Known bugs

 * Once new content is fetched (~each minute), each popup is closed. This
 is due to each marker being recreated on a new fetch. Also the scrollbars
 within the category selection are set to the beginning.


# Libraries & Icons

 * [opening_hours.js](https://github.com/AMDmi3/opening_hours.js/)
 * [leaflet](https://github.com/Leaflet/Leaflet)
 * express
 * socket.io
 * jQuery and jQuery UI

 * [Check Icon](http://thenounproject.com/noun/check-mark/#icon-No2784) by P.J. Onori, from The Noun Project
 * [Edit Icon](http://thenounproject.com/noun/edit/#icon-No5587) by Naomi Atkinson, from The Noun Project


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



