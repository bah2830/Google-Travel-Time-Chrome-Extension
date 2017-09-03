var baseURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&traffic_model=best_guess&departure_time=now';

var settings = {
    startAddress: '',
    endAddress: '',
    apiToken: ''
};

var trafficDuration = {text: '', minutes: ''};
var normalDuration = {text: '', minutes: ''};

// Get the settings from chrome storage
chrome.storage.sync.get({
    addressStart: '',
    addressEnd: '',
    apiToken: ''
}, function(items) {
    settings.startAddress = items.addressStart;
    settings.endAddress = items.addressEnd;
    settings.apiToken = items.apiToken;

    checkTravelTimes();
});

// Get rgba color for current traffice
var getBadgeBackgroundColor = function() {
    var percentFromNormal = Math.round((trafficDuration.minutes / normalDuration.minutes) * 100);

    // Good traffic. Green
    if (percentFromNormal <= 100) {
        return [0, 100, 0, 255];
    }

    // Bad traffic. Red
    if (percentFromNormal >= 200) {
        return [100, 0, 0, 255];
    }

    // Getting Bad. Orange
    if (percentFromNormal >= 150) {
        return [230, 138, 0, 255];
    }

    // Moderate traffic. Yellow
    return [79, 179, 0, 255];
}

// Make API call to get traffic times
var checkTravelTimes = function() {
    var url = baseURL + '&origins=' + settings.startAddress + '&destinations=' + settings.endAddress + '&key=' + settings.apiToken;

    $.getJSON(url, function(data) {
        trafficDuration.text = data.rows[0].elements[0].duration_in_traffic.text;
        trafficDuration.minutes = Math.round(data.rows[0].elements[0].duration_in_traffic.value / 60);

        normalDuration.text = data.rows[0].elements[0].duration.text;
        normalDuration.minutes = Math.round(data.rows[0].elements[0].duration.value / 60);

        chrome.browserAction.setBadgeBackgroundColor({ color: getBadgeBackgroundColor() });
        chrome.browserAction.setBadgeText({text: String(trafficDuration.minutes)});
    });
};

// Create alarm to run every 5 minutes. 288 requests per day if chrome is on 24 hours a day.
chrome.alarms.create({ delayInMinutes: 5, periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(checkTravelTimes);