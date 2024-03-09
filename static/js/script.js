// Sources used:
// https://developers.google.com/maps/documentation/javascript/overview
// https://developers.google.com/maps/documentation/javascript/geocoding
// https://developers.google.com/maps/documentation/javascript/places
// https://developers.google.com/maps/documentation/javascript/directions
// https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript


var evenRowColor = "lightblue";
var oddRowColor = "rgb(164, 187, 176)";
var newImg;
var iframe;
var map;
var elements;
var directionsLoaded = false;
const myLatLng = { lat: 44.9727, lng: -93.23540000000003 };


async function PlaceGoogleMapMarkers() {
    let eventAdd;
    let eventTime;
    let eventDay;
    let eventName;

    var currentMaker = null;

    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    map = new google.maps.Map(iframeDocument.body, {
        zoom: 14,
        center: myLatLng
    });


    for(let i = 1; i < elements.length; i++){
        eventDay = elements[i].cells[0].innerHTML;
        eventName = elements[i].cells[1].innerHTML;
        eventTime = elements[i].cells[2].innerHTML;
        eventAdd = elements[i].cells[3].innerHTML;


        (function (eventAdd, eventName, eventTime, eventDay) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: eventAdd }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var marker = new google.maps.Marker({
                        position: results[0].geometry.location,
                        map: map,
                        title: eventName
                    });

                    var infoWindow = new google.maps.InfoWindow({
                        content: '<strong>' + eventName + '</strong><br>' +
                            'Day: ' + eventDay + '<br>' +
                            'Time: ' + eventTime + '<br>' +
                            'Address: ' + eventAdd
                    });

                    marker.addListener('click', function () {
                        if(currentMaker){
                            currentMaker.close();
                        }
                        infoWindow.open(map, marker);
                        currentMaker = infoWindow;
                    });
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        })(eventAdd, eventName, eventTime, eventDay);
    }
}

function getDirections() {
    const dirPanel = document.getElementById("directionsPanel");
    while(dirPanel.firstChild){
        dirPanel.removeChild(dirPanel.lastElementChild);
    }
    var addressInput = document.getElementById('addressInput').value;
    var selectedTravelMode = document.querySelector('input[name="travelMode"]:checked').value;

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addressInput }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            var destinationLocation = results[0].geometry.location;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var originLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var destinationMarker = new google.maps.Marker({
                        position: destinationLocation,
                        map: map,
                    });

                    var userMarker = new google.maps.Marker({
                        position: originLocation,
                        map: map,
                    });

                    var directionsService = new google.maps.DirectionsService();
                    var directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsRenderer.setMap(map);
                    directionsRenderer.setPanel(document.getElementById('directionsPanel'));

                    var request = {
                        origin: originLocation,
                        destination: destinationLocation,
                        travelMode: selectedTravelMode
                    };

                    directionsService.route(request, function (response, status) {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(response);
                            directionsLoaded = true;
                        } else {
                            console.error('Error getting directions:', status);
                        }
                    });
                });
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        }
        else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function ClockSetUp(){
    var intervalId = setInterval(ChangeTimeContainers, 1000);
}

function MouseHoverHandler(index, img){
    elements[index].style.backgroundColor = "yellow";
    newImg = document.createElement("img");
    newImg.src = img;
    newImg.width = "120";
    newImg.height = "90";
    newImg.style.paddingLeft = "50px";
    elements[index].cells[3].appendChild(newImg);

    let bigImg = document.getElementById("big-picture");
    bigImg.src=img;
    bigImg.width = "500";
    bigImg.height = "375";
}

function MouseStopHoverHandler(index){
    if(index % 2 == 0){
        elements[index].style.backgroundColor = evenRowColor;
    }
    else{
        elements[index].style.backgroundColor = oddRowColor;
    }
    elements[index].cells[3].removeChild(newImg);
}

function ScheduleSetUp(){
    ClockSetUp();
    elements = document.querySelectorAll("tr");
    iframe = document.getElementById("schedule-map");
    PlaceGoogleMapMarkers();
}

function FormSetUp(){
    ClockSetUp();
    iframe = document.getElementById("form-map");
    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    map = new google.maps.Map(iframeDocument.body, {
        zoom: 14,
        center: myLatLng
    });

    google.maps.event.addListener(map, 'click', function(event) {
        geocodeLatLng(event.latLng);
    });
}

function ButtonEvent(){
    console.log("form submitted");
}

function ChangeTimeContainers(){
    let currDateTime = new Date();

    let hourNum = currDateTime.getHours();
    if(hourNum >= 12){
        document.getElementById("am-pm-container").innerHTML = "PM";
    }
    else{
        document.getElementById("am-pm-container").innerHTML = "AM";
    }
    hourNum %= 12;
    if(hourNum == 0){
        hourNum = 12;
    }
    document.getElementById("HourContainer").innerHTML = hourNum;

    let minNum = currDateTime.getMinutes();
    if(minNum < 10){
        document.getElementById("MinuteContainer").innerHTML = "0" + minNum;    
    }
    else{
        document.getElementById("MinuteContainer").innerHTML = minNum;
    }

    let secNum = currDateTime.getSeconds();
    if(secNum < 10){
        document.getElementById("SecondContainer").innerHTML = "0" + secNum;        
    }
    else{
        document.getElementById("SecondContainer").innerHTML = secNum;
    }
}

function geocodeLatLng(latLng) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': latLng}, function(results, status) {
        if (status === 'OK' && results[0]) {
            var address = results[0].formatted_address;
            document.getElementById('event-location').value = address;
        }
    });
}

