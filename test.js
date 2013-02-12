var xpath = require('xpath')
    , dom = require('xmldom').DOMParser
    , fs = require('fs');

var xml = fs.readFileSync('./xapi_meta.xml', 'utf-8');

var doc = new dom().parseFromString(xml)    
var nodes = xpath.select("//node", doc)

console.log(nodes[0].toString())

var new_doc = new dom().parseFromString( nodes[0].toString() );
var lat = xpath.select("//node/@lat", new_doc)[0].value
var lon = xpath.select("//node/@lon", new_doc)[0].value
console.log('lat' + lat)

