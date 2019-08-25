 //Defines the map and it's properties
 mapboxgl.accessToken =
 'pk.eyJ1IjoiYWZtb2xlaXJpbmhvIiwiYSI6ImNqemZsNjd6NjBkZG8zbXQ2ZHB6Zm1tbHIifQ.yyGiw-8cssUPO86hZFvZ_Q';       
var map = new mapboxgl.Map({
 //  hash: true, //show on the url
 container: 'map',
 style: 'mapbox://styles/mapbox/dark-v10?optimize=true',
 zoom: 6,
 center: [-8.5, 39.5],
});
//Gets and sets the number of web workers instantiated on a page with GL JS maps
map.workerCount =2;
//Gets and sets the maximum number of images 
map.maxParallelImageRequests = 4;
map.on('load', function () {
 let locations = mainjson.features
 var markers = []
 for (let i = 0; i < locations.length; i++) {
     let city = locations[i].city;
     let popup = new mapboxgl.Popup({
             offset: 25,
         })
         .setHTML(`<h1>${locations[i].city}</h1>`)
     var marker = new mapboxgl.Marker()
         .setPopup(popup)
         .setLngLat([locations[i].geometry.coordinates[0], locations[i].geometry.coordinates[1]])
         .addTo(map);
     locations[i].marker = marker
     locations[i].className = "entry";
     // console.log(sidebar);
     // console.log(city);
     let ul = document.getElementById("entry-list");
     let li = document.createElement('li');
     li.className = "entry";
     li.id = city;
     li.innerHTML = "<b>" + city + "</b>";
     // console.log(li);
     ul.appendChild(li);
 }
});

//locate person
map.addControl(new mapboxgl.GeolocateControl({
 positionOptions: {
     enableHighAccuracy: true
 },
 trackUserLocation: true
}));

//Query results 
var geocoder = new MapboxGeocoder({
 accessToken: mapboxgl.accessToken,
 mapboxgl: mapboxgl,
 localGeocoder: coordinatesGeocoder,
 countries: 'pt',
 placeholder: 'Search for places in Portugal', // Placeholder text for the search bar
});
map.addControl(geocoder);
getLocations = () => {
 fetch('https://api.mapbox.com/%7Portugal%7D?access_token' + mapboxgl.accessToken)
     .then(res => res.json())
     .catch();
}

/* Function removed from the MapBox API Documentation
* given a query in the form "lng, lat" or "lat, lng" returns the matching
* geographic coordinate(s) as search results in carmen geojson format,
* https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
*/
var coordinatesGeocoder = function (query) {
 // match anything which looks like a decimal degrees coordinate pair
 var matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
 if (!matches) {
     return null;
 }

 function coordinateFeature(lng, lat) {
     return {
         center: [lng, lat],
         geometry: {
             type: "Point",
             coordinates: [lng, lat]
         },
         place_name: 'Lat: ' + lat + ' Lng: ' + lng, // eslint-disable-line camelcase
         place_type: ['coordinate'],
         properties: {},
         type: 'Feature'
     };
 }

 var coord1 = Number(matches[1]);
 var coord2 = Number(matches[2]);
 var geocodes = [];

 if (coord1 < -90 || coord1 > 90) {
     // must be lng, lat
     geocodes.push(coordinateFeature(coord1, coord2));
 }

 if (coord2 < -90 || coord2 > 90) {
     // must be lat, lng
     geocodes.push(coordinateFeature(coord2, coord1));
 }

 if (geocodes.length === 0) {
     // else could be either lng, lat or lat, lng
     geocodes.push(coordinateFeature(coord1, coord2));
     geocodes.push(coordinateFeature(coord2, coord1));
 }

 return geocodes;
};

//Switch styles of map
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
 var layerId = layer.target.id;
 map.setStyle('mapbox://styles/mapbox/' + layerId);
}
for (var i = 0; i < inputs.length; i++) {
 inputs[i].onclick = switchLayer;
}

/**
* Side Bar Toggle
*/
const sidebarToggle = document.getElementById("toggle-sidebar");

function someFunction(event) {
 var element = document.getElementById("sidebar");
 if (element.style.display === "none") {
     element.style.display = "block";
 } else {
     element.style.display = "none";
 }
}
sidebarToggle.addEventListener('click', () => {
 someFunction();
});


/**
* Side Bar Interactivity
*/
document.getElementById("input-search").addEventListener('input', function (event) {
 var locations = mainjson.features;
 //List of all locations

 var listLocations = locations.map((item) => {
     return item.city;
 });
 //retrieve values that don't match the current input Value
 var inputMatch = listLocations.filter((item) => {
     return item.toLowerCase().includes(this.value.toLowerCase())
 });

 var self = this.value.toString().toLowerCase();

 var listIds = locations.map(item => item.id);

 if (self.trim() === "") {
     locations.forEach((item) => {
         var sideBarExists = document.getElementById(item.city);
         if (!sideBarExists) {
             let li = document.createElement('li');
             li.className = "entry";
             li.id = item.city;
             li.innerHTML = "<b>" + item.city + "</b>";
             let ul = document.getElementById("entry-list").appendChild(li);
             item.marker.addTo(map);
         }

     })
 } else {
     locations.forEach((item) => {
         var sideBarExists = document.getElementById(item.city);
         if (item.city.toLowerCase().includes(self) && !sideBarExists) {
             // console.log("adicionado" + item.city)
             let li = document.createElement('li');
             li.className = "entry";
             li.id = item.city;
             li.innerHTML = "<b>" + item.city + "</b>";
             let ul = document.getElementById("entry-list").appendChild(li);
             item.marker.addTo(map);

         } else if (!item.city.toLowerCase().includes(self) && sideBarExists) {
             // console.log("remover" + item.city)
             listIds.splice(listIds.indexOf(item.id), 1);
             document.getElementById(item.city).remove();
             item.marker.remove();

         }
     });
 }
});
