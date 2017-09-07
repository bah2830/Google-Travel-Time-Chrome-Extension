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
    $.each(addresses, function(i, address) {
        var url = baseURL + '&origins=' + address.start + '&destinations=' + address.end + '&key=' + apiToken;
        $.getJSON(url, function(data) {
            if (data.rows[0] != null) {
                durationResults[address.name] = {
                    normal: {
                        text: data.rows[0].elements[0].duration.text,
                        minutes: Math.round(data.rows[0].elements[0].duration.value/ 60),
                    }
                }

                if (data.rows[0].elements[0].duration_in_traffic != undefined) {
                    durationResults[address.name]["traffic"] = {
                        text: data.rows[0].elements[0].duration.text,
                        minutes: Math.round(data.rows[0].elements[0].duration.value/ 60),
                    }
                } else {
                    durationResults[address.name]["traffic"] = durationResults[address.name]["normal"];
                }
            } else {
                durationResults[address.name] = {
                    normal: { text: "N/A", minutes: "N/A" },
                    traffic: { text: "N/A", minutes: "N/A" },
                }
            }

            if (i == 0 && durationResults[address.name].traffic.minutes != "N/A") {
                chrome.browserAction.setBadgeBackgroundColor({ color: getBadgeBackgroundColor(durationResults[address.name]) });
                chrome.browserAction.setBadgeText({text: String(durationResults[address.name].traffic.minutes)});
            }
        });
    });
};

// Create alarm to run every 5 minutes. 288 requests per day if chrome is on 24 hours a day.
chrome.alarms.create({ delayInMinutes: 5, periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(checkTravelTimes);