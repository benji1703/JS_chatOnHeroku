/**
 * Created by benjaminarbibe on 27.5.2017.
 */


(function() {

$(document)
    .on("click", ".btn-danger", function (e) {
        alert("Benji");
        // Remove all 
        socket.emit('remove', {
            "_id": "text"
        })
        location.reload();
    });

    var getNode = function (s) {
            return document.querySelector(s);
        },

        // Get required nodes
        status = getNode('.chat-status span'),
        textarea = getNode('.chat textarea'),
        messages = getNode('.chat-messages'),
        chatName = getNode('.chat-name'),

        statusDefault = status.textContent,

        setStatus = function(s) {
            status.textContent = s;

            if (s !== statusDefault && s !== 'No Connection') {
                var delay = setTimeout(function() {
                    setStatus(statusDefault);
                    clearInterval(delay);
                }, 3000);
            }
        };


    try {
        var socket = io.connect("/");
    }
    catch(e) {
        setStatus("No Connection")
    }

    if (socket !== undefined) {

        // Listen for output

        socket.on('output', function(data) {

            if(data.length){

                //Loop through the results

                for(var x = 0; x < data.length; x = x + 1){

                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.innerHTML =
                        "<div class='message_wrapper'>" +
                        "<div class='message_container'>" +
                        "<header><span class='name'>" + data[x].name + "</span><span class='time'>" + data[x].timesent +
                        "</span></div></header>" +
                        "<span class='message_content'>"+data[x].message+"</span>" +
                        "</div>";

                    // Apppend

                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }

        });

        // Listen for status

        socket.on('status', function(data) {

            setStatus((typeof data === 'object') ? data.message : data);

            if(data.clear === true) {
                textarea.value = '';
            }

        });

        // Listen to the keyStrokes

        textarea.addEventListener('keydown', function(event) {
            var self = this,
                name = chatName.value;
            var d = new Date();
            var now = d.toLocaleTimeString();


            //Sending with enter, not when shift is pressed

            if(event.which === 13 && event.shiftKey === false) {
                socket.emit('input', {
                    name: name,
                    message: self.value,
                    timesent: now,
                });

            }
        });


    }
})();