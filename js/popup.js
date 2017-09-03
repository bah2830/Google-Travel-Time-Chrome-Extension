var bg = chrome.extension.getBackgroundPage();
var settings = bg.settings;
var duration = bg.trafficDuration;

console.log(duration);

document.getElementById('start_address').textContent = settings.startAddress;
document.getElementById('end_address').textContent = settings.endAddress;
document.getElementById('duration').textContent = duration.text;

var bgC = bg.getBadgeBackgroundColor();
document.getElementById('duration').style.color = "rgb(" + bgC[0] + ", " + bgC[1] + ", " + bgC[2] + ")";
