var baseURL = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&traffic_model=best_guess&departure_time=now';
var apiToken = '';
var addresses = [];
var durationResults = {};

// Get the settings from chrome storage
function getSettings() {
    chrome.storage.sync.get({
        apiToken: '',
        addresses: {}
    }, function(items) {
        apiToken = items.apiToken;
        addresses = items.addresses;
        checkTravelTimes();
    });
}
getSettings();

chrome.storage.onChanged.addListener(getSettings);

// Get rgba color for current traffice
var getBadgeBackgroundColor = function(duration) {
    var percentFromNormal = Math.round((duration.traffic.minutes / duration.normal.minutes) * 100);

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
    var origins = '';
    var destinations = '';
    $.each(addresses, function(i, address) {
        if (i == 0) {
            origins = address.start;
            destinations = address.end;
        } else {
            origins += "|" + address.start;
            destinations += "|" + address.end;
        }
    });

    var url = baseURL + '&origins=' + origins + '&destinations=' + destinations + '&key=' + apiToken;

    $.getJSON(url, function(data) {
        $.each(addresses, function(i, address) {
            durationResults[address.name] = {
                normal: {
                    text: data.rows[i].elements[i].duration.text,
                    minutes: Math.round(data.rows[i].elements[i].duration.value/ 60),
                }
            }

            if (data.rows[i].elements[i].duration_in_traffic != undefined) {
                durationResults[address.name]["traffic"] = {
                    text: data.rows[i].elements[i].duration.text,
                    minutes: Math.round(data.rows[i].elements[i].duration.value/ 60),
                }
            } else {
                durationResults[address.name]["traffic"] = durationResults[address.name]["normal"];
            }

            if (i == 0) {
                chrome.browserAction.setBadgeBackgroundColor({ color: getBadgeBackgroundColor(durationResults[address.name]) });
                chrome.browserAction.setBadgeText({text: String(durationResults[address.name].traffic.minutes)});
            }
        });
    });
};

// Create alarm to run every 5 minutes. 288 requests per day if chrome is on 24 hours a day.
chrome.alarms.create({ delayInMinutes: 5, periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(checkTravelTimes);