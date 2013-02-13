var map;

document.addEventListener('DOMContentLoaded', function() {
  map = L.map('map').setView([48.400500,9.979434], 14);
  L.tileLayer('http://{s}.tile.cloudmade.com/1443dfdd3c784060aedbf4063cd1709b/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
  }).addTo(map);


  var socket = io.connect('http://localhost');
  socket.on('marker', function (coords) {    
    L.marker([coords.lat, coords.lon]).addTo(map).bindPopup(coords.desc);
  });
}, false);
