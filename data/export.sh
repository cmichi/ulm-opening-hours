#!/bin/sh
#http://wiki.openstreetmap.org/wiki/Opening_hours
#http://taginfo.openstreetmap.org/keys/?key=opening_hours#overview
#http://wiki.openstreetmap.org/wiki/Osmium
#http://wiki.openstreetmap.org/wiki/Overpass_API

curl --globoff "http://www.overpass-api.de/api/xapi_meta?*[bbox=9.9022,48.3443,10.0773,48.4473][opening_hours=*]" > test.xml
