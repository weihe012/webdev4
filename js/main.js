// main.js

// initialize map
var map = L.map("map", {
    center: [46.73, -92.107],
    zoom: 11
});

// add base layer
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

///////////////////////////////////////////////////////////////////////////////
// INFO CONTROL
// This will display the feature information that is under our mouse
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =
    (props ? "<h4>Precinct: "+props.PCTNAME+"</h4>"+
	"<table><tr><td>Democratic votes: </td><td>"+props.USPRSDFL+"</td></tr>"+
	"<tr><td>Republican votes: </td><td>"+props.USPRSR+"</td></tr>"+
	"<tr><td>Total votes: </td><td>"+props.USPRSTOTAL+"</td></tr></table>" : "Hover over a precinct to see vote counts");
};

info.addTo(map);

///////////////////////////////////////////////////////////////////////////////
// ADDING AND SYMBOLIZING GEOJSON
// create request for GeoJSON
var request = new Promise(function(resolve, reject){
	var request = new XMLHttpRequest();
	request.addEventListener("load", function(){ resolve(this.responseText) });
	request.open("GET", "data/duluth_precincts_WGS84.geojson");
	request.send();
});

// handle request
request.then(function(values){
	// parse the incoming datasets into JSON format
	var precincts = JSON.parse(values);
	console.log('precincts:', precincts);

	// our style method for the precincts
	function style (feature) {
    	var demVote = feature.properties.USPRSDFL;
    	var repVote = feature.properties.USPRSR;
    	var totalVote = feature.properties.USPRSTOTAL;
    	var pctDem = (demVote / totalVote) * 100;
    	var pctRep = (repVote / totalVote) * 100;
    	var proportionDem = pctDem - pctRep;


    	// console.log('demVote:', demVote);
    	// console.log('repVote:', repVote);
    	// console.log('totalVote:', totalVote);
    	console.log('proportionDem:', proportionDem);

    	var fill;
    	// quantile classification
    	if (proportionDem <= 21) {
    		fill = '#deebf7';
    	}
    	else if (proportionDem <= 34) {
    		fill = '#9ecae1';
    	}
    	else {
    		fill = '#3182bd';
    	}

    	// return style specification
        return {
        	color: '#636363',
        	dashArray: '3',
        	weight: 1,
        	fillColor: fill,
        	fillOpacity: 0.7
        };
    }

	///////////////////////////////////////////////////////////////////////
	// INTERACTIVITY
	// Add some interactivity to the map using the mouse "hover"
	// Based on tutorial from leaflet
	// ref: https://leafletjs.com/examples/choropleth/

	// DISCUSS EVENTS (LISTENERS AND HANDLERS)
	// ref: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events

	// event handler for mouseover event
	// highlights feature that was moused (hovered) over
	function highlightFeature(e) {
		// get the feature that was targeted in this event
		// (ie. the one that is being hovered over)
	    var feature = e.target;

	    // set the new style for the feature
	    feature.setStyle({
	        weight: 5,
	        color: '#666',
	        dashArray: '',
	        fillOpacity: 0.7
	    });

	    // bring the feature to the front (except for some browsers)
	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        feature.bringToFront();
	    }

	    // update the info box
	    info.update(feature.feature.properties);
	}

	// mouseout handler
	// reset the style to normal
	function resetHighlight(e) {
	    precinctsLayer.resetStyle(e.target);
	    info.update();
	}

	// do something for each feature in the layer when you load the layer
	// in this case it's adding these event listeners
	function onEachFeature(feature, layer) {
	    layer.on({
	    	// mouse enters the feature (polygon)
	        mouseover: highlightFeature,
	        // mouse leaves the feature
	        mouseout: resetHighlight
	    });
	}

	// Finally, now that everything is defined we can create the layer and
	// add it to the map
	//create a polygon layer for precincts
	var precinctsLayer = L.geoJSON(precincts, {
	    style: style,
	    onEachFeature: onEachFeature
    });

	// add precincts layer to map
  	precinctsLayer.addTo(map);

  	// FIXME: Display the current location of the mouse in latitude and
  	// longitude coordinates.
  	// Update this display as the mouse moves around the map.
  	// This doesn't have to use a leaflet control like the example above
  	// but it could
  	// hint: make use of the map events found here:
  	// https://leafletjs.com/reference-1.3.4.html#map-click
  	// and the lat/long that is a part of mouse events here:
  	// https://leafletjs.com/reference-1.3.4.html#mouseevent-latlng

  	// more hints:
  	//  - first, create an event handler that will take the lat / long
  	//    and update an HTML (div) element with that information
  	//  - second, register an event listener with the map
  	//    (something like map.on(....))
  	//  - when it doubt use Google
  	//    (something to the effect of "leaflet display mouse coordinates"
  	//    should help)

});