var socket = io();

var tv = new television($('video[data-television=player]').get(0));

$('button[data-television=media]').each(function () {
    $(this).click(function() {
        var data = {
            action: $(this).data('television-action'),
            state: {
                time: tv.time
            }
        }
        switch ($(this).data('television-action')) {
            case 'open':
                data.source = $('input[data-television=source]').val();
                break;
            default:
                break;
        }
        socket.emit('media', data);
        tv.action(data);
    });
});

socket.on('media', function (data) {
    tv.action(data);
});