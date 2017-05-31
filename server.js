/**
 * Created by benjaminarbibe on 27.5.2017.
 */

var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(process.env.PORT || 8080).sockets,
    objectid = require('mongodb').objectId;

mongo.connect('mongodb://heroku_9706qqt1:0sCKhna8zCQ881FM@ds157631.mlab.com:57631/heroku_9706qqt0', function (err, db) {
    if(err) throw err;

    client.on('connection', function(socket) {

        var col = db.collection('messages'),
            sendStatus = function(s) {
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
                console.log("Test")
                sendStatus({
                    message: "Message removed",
                    clear: true
                });

            });
        });
    });
});