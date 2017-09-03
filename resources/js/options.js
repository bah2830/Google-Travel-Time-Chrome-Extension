var apiToken = '';
var address = {
    name: '',
    start: '',
    end: ''
};

function save_options() {
    var apiToken = document.getElementById('api_token').value;

    var addresses = [];
    $('.address_row').each(function() {
        var rowNum = $(this).attr('id').replace("address_row_", "");

        address = {
            name: $('#address_name_' + rowNum).val(),
            start: $('#address_start_' + rowNum).val(),
            end: $('#address_end_' + rowNum).val(),
        };

        addresses.push(address);
    });

    chrome.storage.sync.set({
        apiToken: apiToken,
        addresses: addresses
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        apiToken: '',
        addresses: []
    }, function(items) {
        document.getElementById('api_token').value = items.apiToken;
        $.each(items.addresses, function(i, address) {
            if (i != 0) {
                addAddressRow();
            }

            $('#address_name_' + i).val(address.name);
            $('#address_start_' + i).val(address.start);
            $('#address_end_' + i).val(address.end);
        });
    });
}

function addAddressRow() {
    var addRow = $('#add_address_row');
    var prevRow = addRow.prev()[0];

    var rowNum = 0;
    if (prevRow != undefined) {
        rowNum = parseInt($(prevRow).attr('id').replace('address_row_', '')) + 1;
    }

    var newRow = '<tr id="address_row_' + rowNum + '" class="address_row">'
    newRow += '<td><input id="address_name_' + rowNum + '" type="text" class="name_input"></td>';
    newRow += '<td><input id="address_start_' + rowNum + '" type="text" class="address_input"></td>';
    newRow += '<td><input id="address_end_' + rowNum + '" type="text" class="address_input"></td>';
    newRow += '<td align="right"><span id="delete_address_' + rowNum + '"><img src="../resources/img/delete.png" height="15px"></span></td>';
    newRow += '</tr>';

    $(addRow).before(newRow);

    $('span[id^="delete_address_"]').on('click', function() {
        $('#address_row_' + rowNum).remove();
    });
}

$('#add_address_link').click(function() { addAddressRow(); });

$('span[id^="delete_address_"]').on('click', function() {
    var rowNum = $(this).attr('id').replace('delete_address_', '');
    $('#address_row_' + rowNum).remove();
});

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);