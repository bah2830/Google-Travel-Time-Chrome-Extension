var bg = chrome.extension.getBackgroundPage();
var durationResults = bg.durationResults;

var addRow = function(i) {
    var newRow = '<div class="traffic_detail">';
    newRow += '<div class="addresses"><span id="name_' + i + '" class="address">&nbsp;</span></div>';
    newRow += '<div class="duration_details"><span id="duration_' + i + '">&nbsp;</span></div>';
    newRow += '</div>';

    $('.traffic_detail').last().after(newRow);
}

var i = 0;
$.each(durationResults, function(name, duration) {
    if (i != 0) {
        addRow(i);
    }

    document.getElementById('name_' + i).textContent = name;
    document.getElementById('duration_' + i).textContent = duration.traffic.text;

    var bgC = bg.getBadgeBackgroundColor(duration);
    document.getElementById('duration_' + i).style.color = "rgb(" + bgC[0] + ", " + bgC[1] + ", " + bgC[2] + ")";

    i++;
});
