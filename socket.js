/**
 * Created by benjaminarbibe on 2.6.2017.
 */

client.on('connection', function(socket) {

    var col = db.collection('messages'),
        sendStatus = function(s) {
            console.log("DB Connected");
            socket.emit('status', s);
        };

    // Retrieve all the messages to the new socket
    col.find().limit(100).sort({_id: 1}).toArray(function(err, res) {
        if(err) throw err;
        socket.emit('output', res)
    });

    // Wait for input
    socket.on('input', function(data) {

        // Grab the valid value
        var id = data._id,
            name = data.name,
            message = data.message,
            timesent = data.timesent,
            whitespaceCheck = /^\s*$/;

        // Checking the value before insert

        if(whitespaceCheck.test(name) || whitespaceCheck.test(message)) {
            sendStatus('Name and Message cant be blank');

        } else {
            // Insert to mongoDB
            col.insert({name: name, message: message, timesent: timesent}, function() {

                // Emit the message to All connected clients
                client.emit('output', [data]);

                sendStatus({
                    message: "Message sent",
                    clear: true
                });
            });
        }

    });

    // Remove by id

    socket.on('remove', function(id) {
        col.deleteOne(id.objectId, function () {
            console.log("Test");
            sendStatus({
                message: "Message removed",
                clear: true
            });

        });
    });
});

