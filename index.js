var map;
var marker;

var nodalId = 3;
var nodalIdCollection = new Set([0, 1, 2]);

var DEFAULT_ZOOM = 6;

var currentLocation = new google.maps.LatLng(52.520816, 13.410186);
var defaultIconImage = 'http://www.clker.com/cliparts/w/d/X/t/j/H/green-pin-with-shadow.svg';
var customIconBase = 'http://maps.google.com/intl/en_us/mapfiles/ms/micons/';
var markerWithShadow = new google.maps.MarkerImage(defaultIconImage, null, null, null, new google.maps.Size(45, 40));

google.maps.event.addDomListener(window, 'load', initialize);

/**
 * Initialize Google Maps API.
 * 
 * @return {void}
 */
function initialize() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: DEFAULT_ZOOM,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: currentLocation
	});

	newMarker(currentLocation, false);
}

/**
 * Change the marker location.
 * 
 * @return {void}
 */
function changeLocation() {
	var lat = parseFloat(prompt('Latitude: '));
	var lng = parseFloat(prompt('Longitude: '));

	if (lat && lng) {
		currentLocation = new google.maps.LatLng(lat, lng);

		newMarker(currentLocation, true);
		map.setZoom(DEFAULT_ZOOM);
		map.panTo(currentLocation);
	}
}

/**
 * Set a new level of zoom.
 * 
 * @return {void}
 */
function adjustZoom() {
	var zoom = parseInt(prompt('Zoom: '));

	if (zoom) {
		map.setZoom(zoom);
	}
}

/**
 * Drop a custom marker.
 * 
 * @return {[type]} [description]
 */
function dropCustomMarker() {
	var lat = parseFloat(prompt('Latitude: '));
	var lng = parseFloat(prompt('Longitude: '));

	var colour = document.getElementById('colour-selector').value;
	var style = document.getElementById('style-selector').value;
	var number = document.getElementById('number-selector').value;

	if (lat && lng) {
		var location = new google.maps.LatLng(lat, lng);

		newCustomMarker(location, style, colour, number);
		map.setZoom(DEFAULT_ZOOM);
		map.panTo(location);
	}
}

/**
 * Drop a custom marker.
 * 
 * @return {void}
 */
function dropMouseEventMarker() {
	var lat = parseFloat(prompt('Latitude: '));
	var lng = parseFloat(prompt('Longitude: '));

	var mouseEvent = document.getElementById('event-selector').value;

	if (lat && lng) {
		var location = new google.maps.LatLng(lat, lng);

		newMouseEventMarker(location, mouseEvent);
		map.setZoom(DEFAULT_ZOOM);
		map.panTo(location);
	}
}

/**
 * Add custom weather info depending on the user choices.
 *
 * @return {void}
 */
function addWeatherInfo() {
	if (!validateWeatherInfo()) {
		return;
	}

	var lat = parseFloat(prompt('Latitude: '));
	var lng = parseFloat(prompt('Longitude: '));

	if (lat && lng) {
		var location = new google.maps.LatLng(lat, lng);
		var weatherType = document.getElementById('weather-selector').value;
		var title = document.getElementById('weather-title').value;
		var description = document.getElementById('weather-description').value;
		var videoUrl = document.getElementById('video-id').value;

		newWeatherMarker(location, weatherType, title, description, videoUrl);
		map.setZoom(DEFAULT_ZOOM);
		map.panTo(location);
	}
}

/**
 * Adds a detailed map.
 *
 * @return {void}
 */
function addDetailedMap() {
	drawRegion();
}

/**
 * Multilevel zoom function.
 * 
 * @return {void}
 */
function multiLevelZoom() {
	var infoWindowZoom5 = new google.maps.InfoWindow();
	infoWindowZoom5.setContent('<h4>Berlin</h4><div>Berlin is the captiol city of Germany </div>');

	var infoWindowZoom8 = new google.maps.InfoWindow();
	infoWindowZoom8.setContent('<h4>Berlin</h4><div>During winter Belin undergoes a lot of change. Subfreeling temperature is only one side of the story.</div>');

	var infoWindowZoom10 = new google.maps.InfoWindow();
	infoWindowZoom10.setContent('<h4>Berlin Winter</h4><div><iframe src="https://www.youtube.com/embed/1njeIO1VMU8" frameborder="0" allowfullscreen></iframe></div>');

	google.maps.event.addListener(map, 'zoom_changed', function() {
	    var zoom = map.getZoom();

	    if (zoom == 5) {
	    	infoWindowZoom5.open(map, marker);
	    	infoWindowZoom8.close();
	    	infoWindowZoom10.close();
	    } else if (zoom == 8 ) {
	    	infoWindowZoom5.close();
	    	infoWindowZoom8.open(map, marker);
	    	infoWindowZoom10.close();
	    } else if (zoom == 10) {
	    	infoWindowZoom5.close();
	    	infoWindowZoom8.close();
	    	infoWindowZoom10.open(map, marker);
	    } else {
			infoWindowZoom5.close();
			infoWindowZoom8.close();
			infoWindowZoom10.close();
	    }
	});

	map.setCenter(currentLocation);
	map.setZoom(4);

	smoothZoom(map, 11, map.getZoom());
}

/**
 * Add a new marker with the given dimentions.
 * 
 * @param  {number} width  width of the marker
 * @param  {number} height height of the marker
 * @return {void}
 */
function newMarker(location, isReplace) {
	if (isReplace) { 
		marker.setMap(null);
	}

	marker = new google.maps.Marker({
			position: location,
			map: map,
			animation: google.maps.Animation.DROP,
			icon: markerWithShadow
		});

	google.maps.event.addListener(marker, 'click', toggleBounce);
}

/**
 * Add a new custom marker.
 * 
 * @param  {LatLng} location  location of the marker
 * @param  {string} style    style of the marker
 * @param  {string} colour   colour of the marker
 * @return {void}
 */
function newCustomMarker(location, style, colour, number) {
	var icon = markerWithShadow;

	if (style && colour) {
		var iconImage;

		switch (style) {
			case 'default':
				iconImage = customIconBase + colour + '.png';
				break;
			case 'dot':
				iconImage = customIconBase + colour + '-dot.png';
				break;
		}

		icon = new google.maps.MarkerImage(iconImage, null, null, null, new google.maps.Size(36, 36));
	}

	var customMarker = new google.maps.Marker({
			position: location,
			map: map,
			animation: google.maps.Animation.DROP,
			icon: icon,
			label: number
		});

	google.maps.event.addListener(customMarker, 'click', function () {
		if (customMarker.getAnimation() != null) {
			customMarker.setAnimation(null);
		} else {
			customMarker.setAnimation(google.maps.Animation.BOUNCE);
		}
	});
}

/**
 * Sets an animation to trigger on mouse event.
 * 
 * @param  {LatLng} location Location of the marker.
 * @param  {String} event    MouseEvent type.
 * @return {void}
 */
function newMouseEventMarker(location, mouseEvent) {
	var mouseEventMarker = new google.maps.Marker({
			position: location,
			map: map,
			animation: google.maps.Animation.DROP,
			icon: markerWithShadow
		});

	google.maps.event.addListener(mouseEventMarker, mouseEvent, function () {
		if (mouseEventMarker.getAnimation() != null) {
			mouseEventMarker.setAnimation(null);
		} else {
			mouseEventMarker.setAnimation(google.maps.Animation.BOUNCE);
		}
	});
}

/**
 * Create a weather marker.
 * 
 * @param  {[type]} location    [description]
 * @param  {[type]} weather     [description]
 * @param  {[type]} title       [description]
 * @param  {[type]} description [description]
 * @param  {[type]} videoID     [description]
 * @return {[type]}             [description]
 */
function newWeatherMarker(location, weather, title, description, videoID) {
	var icon = new google.maps.MarkerImage('img/' + weather + '.png', null, null, null, new google.maps.Size(36, 36));

	var weatherMarker = new google.maps.Marker({
			position: location,
			map: map,
			animation: google.maps.Animation.DROP,
			icon: icon
		});

	google.maps.event.addListener(weatherMarker, 'click', function () {
		var infoWindow = new google.maps.InfoWindow();
		var content = '<div class=\"weather-title\">' + title + '</div>'
			+ '<div>' + description + '</div>'
			+ '<iframe class=\"weather-video\" src=\"https://www.youtube.com/embed/' + videoID + '\" frameborder=\"0\" allowfullscreen></iframe>';

		infoWindow.setContent(content);
		infoWindow.open(map, weatherMarker);
	});
}

/**
 * Create a detailed map Marker.
 * 
 * @param  {Location} location Location of the marker.
 * @return {void} 
 */
function newDetailedMapMarker(lat, lng) {
	document.getElementById('inner-map').innerHTML = '';
	document.getElementById('inner-map').style.display = 'block';
	
	var detailedMapMarker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: map
		});

	google.maps.event.addListener(detailedMapMarker, 'click', function () {
		var innerDiv = document.createElement('div');
		innerDiv.style.height = '200px';
		innerDiv.style.width = '200px';
		document.getElementById('map').appendChild(innerDiv);

		var overViewOpts = {
			zoom: 12,
			center: detailedMapMarker.getPosition(),
			mapTypeId: map.getMapTypeId(),
			disableDefaultUI: true
		};

		var detailMap = new google.maps.Map(innerDiv, overViewOpts);

		var innerMarker = new google.maps.Marker({
			position: detailedMapMarker.getPosition(),
			map: detailMap,
			clickable: false
		});
		
		var infoWindow;

		if (!infoWindow) {
			infoWindow = new google.maps.InfoWindow();
		}

		infoWindow.setContent(innerDiv);
		infoWindow.open(map, detailedMapMarker);
	});

	setTimeout(null, 2000);
	document.getElementById('inner-map').style.display = 'none';
}

/**
 * Toggle the bounce animation.
 * 
 * @return {void}
 */
function toggleBounce() {
	if (marker.getAnimation() != null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

/**
 * Validate the weather fields.
 * 
 * @return {boolean} isValid
 */
function validateWeatherInfo() {
	var title = document.getElementById('weather-title');
	var description = document.getElementById('weather-description');
	var videoID = document.getElementById('video-id');

	if (title.value == '') {
		alert('Please enter a valid title.');
		title.focus();
	} else if (description.value == '') {
		alert('Please enter a valid description.');
		description.focus();
	} else if (videoID.value == '')  {
		alert('Please enter a valid video URL.');
		videoID.focus();
	} else {
		return true;
	}

	return false;
}

/**
 * Smooth zoom functionality.
 * 
 * @param  {Map} map The map to apply the function to.
 * @param  {int} max Max zoom level.
 * @param  {int} cnt Starting zoom level.
 * @return {void}
 */
function smoothZoom(map, max, cnt) {
    if (cnt >= max) {
        return;
    } else {
        var z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoom(map, max, cnt + 1);
        });

        setTimeout(function(){
        	map.setZoom(cnt);
        }, 2000);
    }
} 

function drawRegion() {
	var nodes = new Set();
	var colour = document.getElementById('region-colour').value;
	var bounds = new google.maps.LatLngBounds();

	nodalIdCollection.forEach(function (node) {
		var lat = parseFloat(document.getElementById('lat-' + node).value);
		var lng = parseFloat(document.getElementById('lng-' + node).value);

		if (lat != '' && lng != '') {
			nodes.add({lat: lat, lng: lng});
		}
	});

	var polygon = new google.maps.Polygon({
		paths: [...nodes],
		strokeColor: colour,
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: colour,
		fillOpacity: 0.35,
		clickable: false
	});

	polygon.setMap(map);

	nodes.forEach(function (node) {
		var lat = node.lat;
		var lng = node.lng;

		newDetailedMapMarker(lat, lng);
		
		var location = new google.maps.LatLng(lat, lng);
		bounds.extend(location);
	});

	var center = bounds.getCenter();
	newDetailedMapMarker(center.lat(), center.lng());
	map.panTo(center);
}

/**
 * Adds a new UI Elements tpo display the nodal points.
 */
function addNewNodalPoint() {
	var label = document.createElement('label');
	label.setAttribute('id', 'label-' + nodalId);
	label.innerHTML = 'Nodal Point : ';
	document.getElementById('nodal-points').appendChild(label);

	var latTextBox = document.createElement('input');
	latTextBox.setAttribute('id', 'lat-' + nodalId);
	latTextBox.setAttribute('type', 'Number');
	latTextBox.setAttribute('placeholder', 'Latitude');
	latTextBox.setAttribute('style', 'margin-right: 4px');
	document.getElementById('nodal-points').appendChild(latTextBox);

	var lngTextBox = document.createElement('input');
	lngTextBox.setAttribute('id', 'lng-' + nodalId);
	lngTextBox.setAttribute('type', 'number');
	lngTextBox.setAttribute('placeholder', 'Longitude');
	lngTextBox.setAttribute('style', 'margin-right: 4px');
	document.getElementById('nodal-points').appendChild(lngTextBox);

	var deleteButton = document.createElement('input');
	deleteButton.setAttribute('id', 'delete-' + nodalId);
	deleteButton.setAttribute('type', 'button');
	deleteButton.setAttribute('value', 'Delete');
	deleteButton.setAttribute('onclick', 'deleteOnClick(event)');
	document.getElementById('nodal-points').appendChild(deleteButton);

	var firstLineBreak = document.createElement('br');
	firstLineBreak.setAttribute('id', 'firstLineBreak-' + nodalId);
	document.getElementById('nodal-points').appendChild(firstLineBreak);

	var secondLineBreak = document.createElement('br');
	secondLineBreak.setAttribute('id', 'secondLineBreak-' + nodalId);
	document.getElementById('nodal-points').appendChild(secondLineBreak);

	nodalIdCollection.add(nodalId);

	nodalId++;
}

/**
 * Removes a nodal point.
 * 
 * @param  {string} currentNodalId ID of the node to delete
 * @return {void}
 */
function removeNodalPoint(currentNodalId) {
	var container = document.getElementById('nodal-points');

	container.removeChild(document.getElementById('label-' + currentNodalId));
	container.removeChild(document.getElementById('lat-' + currentNodalId));
	container.removeChild(document.getElementById('lng-' + currentNodalId));
	container.removeChild(document.getElementById('delete-' + currentNodalId));
	container.removeChild(document.getElementById('firstLineBreak-' + currentNodalId));
	container.removeChild(document.getElementById('secondLineBreak-' + currentNodalId));
}

/**
 * Delete the elements corresponding to the node.
 * 
 * @param  {MouseEvent} event Event object
 * @return {void}
 */
function deleteOnClick(event) {
	var elemId = event.target.id;
	var strParts = elemId.split('-');

	removeNodalPoint(strParts[1]);
	nodalIdCollection.delete(parseInt(strParts[1]));
}