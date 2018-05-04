var liveData1 = [];
var cityName = 'San Francisco';
var filteredData = [];
var markers = [];
var iterator = 00;
var map;
var infowindow = [];
geocoder = new google.maps.Geocoder();

var centerPointCity = {
    'San Francisco': {
        "lat": 37.788883,
        "lng": -122.405738
    },
    'San Jose': {
        "lat": 37.336721,
        "lng": -121.894074
    },
    'Palo Alto': {
        lat: 37.441671,
        lng: -122.152571
    },
    'Redwood City': {
        lat: 37.486078,
        lng: -122.232089
    },
    'Mountain View': {
        lat: 37.394358,
        lng: -122.076713
    },
    "all": {
        lat: 37.566048,
        lng: -122.289553
    }
};

$(function() {
    requestData1();
});

setInterval(function() {
    requestData1()
}, 60000);

function requestData1() {
    //console.log('data')
    $.getJSON("http://www.bayareabikeshare.com/stations/json", function(data) {
        $("#lastRefreshedTime").html('<h5 class="text-center">Last Refreshed Time - <b style="color:#7CB5EC">' + data.executionTime + '</b></h5>')
        liveData1 = data.stationBeanList;
        filterData1(cityName);
        initialize();
    }, function(error) {
        console.log("Error in getting live data")
    });
}


function filterData1(city) {

    cityName = city || 'San Jose';
    //alert(cityName);
    filteredData = [];
    if (cityName === 'all') {
        filteredData = liveData1
        initialize();
        return;
    }
    for (var i = 0; i < liveData1.length; i++) {
        if (liveData1[i].city === cityName) {
            filteredData.push(liveData1[i]);
        }
    }
    initialize();

}

function initialize() {
    //alert(cityName)
    infowindow = [];
    markers = [];
    iterator = 0;
    region = new google.maps.LatLng(centerPointCity[cityName].lat, centerPointCity[cityName].lng);
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: cityName === 'all' ? 10 : 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: region,
    });
    for (var i = 0; i < filteredData.length; i++) {
        addMarker('Station Name:<b> ' + filteredData[i].stationName + ' - ' + filteredData[i].city + '</b><br>' + 'Available Bikes:<b> ' + filteredData[i].availableBikes + '</b><br>' + 'Available Docks:<b> ' +
            filteredData[i].availableDocks + '</b><br><b>' + Math.round(100 - (filteredData[i].availableBikes / (filteredData[i].availableBikes + filteredData[i].availableDocks) * 100)) + '%</b> of total bikes are rented' + '<br>' + 'Demand:- <b>' + getPrediction(filteredData[i].availableBikes, filteredData[i].availableDocks) + '</b>', filteredData[i].latitude, filteredData[i].longitude);
    }
}

function getPrediction(availableBikes, availableDocks) {
    var total = availableBikes + availableDocks;
    var demand = 100 - (availableBikes / total * 100);
    if (demand > 80) {
        return 'Very High';
    } else if (demand > 60 && demand <= 80) {
        return 'High';
    } else if (demand > 40 && demand <= 60) {
        return 'Moderate';
    } else if (demand > 20 && demand <= 40) {
        return 'Low';
    } else if (demand <= 20) {
        return 'Very Low';
    } else {
        return 'Unknown';
    }
}

function addMarker(address, latitude, longitude) {
    // var address = contentstring[areaiterator];
    var icons = 'bike.ico';
    //var templat = regionlocation[areaiterator].split(',')[0];
    //var templong = regionlocation[areaiterator].split(',')[1];
    var temp_latLng = new google.maps.LatLng(latitude, longitude);
    markers.push(new google.maps.Marker({
        position: temp_latLng,
        map: map,
        icon: icons,
        draggable: false
    }));
    iterator++;
    info(iterator, address);
}

function info(i, address) {
    infowindow[i] = new google.maps.InfoWindow({
        content: address
    });
    infowindow[i].content = address;
    google.maps.event.addListener(markers[i - 1], 'click', function() {
        for (var j = 1; j < filteredData.length + 1; j++) {
            infowindow[j].close();
        }
        infowindow[i].open(map, markers[i - 1]);
    });
}