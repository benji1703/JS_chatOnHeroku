/**
 * Created by benjaminarbibe on 27.5.2017.
 */


(function() {

    $(document).on("click", ".message_checkbox", function(e){
        var id = e.currentTarget.dataset.id.toString();
        var newid = id.substring(1, id.length-1);
        socket.emit('remove', {
            _id: newid
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
        var socket = io.connect('https://chat-js-benji.herokuapp.com/');
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
                        "</div><input data-id='" + data[x]._id + "' class='message_checkbox' type='button' value='Remove'/>" +
                        "<header><span class='name'>" + data[x].name + "</span><span class='time'>" + data[x].timesent +
                        "</span></header>" +
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
                    timesent: now
                });

            }
        });


    }
})();