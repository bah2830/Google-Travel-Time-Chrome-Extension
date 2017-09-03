function save_options() {
    var addressStart = document.getElementById('address_start').value;
    var addressEnd = document.getElementById('address_end').value;
    var apiToken = document.getElementById('api_token').value;

    chrome.storage.sync.set({
        addressStart: addressStart,
        addressEnd: addressEnd,
        apiToken: apiToken
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        addressStart: '',
        addressEnd: '',
        apiToken: ''
    }, function(items) {
        document.getElementById('address_start').value = items.addressStart;
        document.getElementById('address_end').value = items.addressEnd;
        document.getElementById('api_token').value = items.apiToken;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);