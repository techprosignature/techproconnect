if ("serviceWorker"in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/serviceWorker.js", {
            scope: '/techproconnect/'
        }).then(res=>console.log("service worker registered")).catch(err=>console.log("service worker not registered", err))
    })
}
function main() {
    // Get room
    try {
        var user = prompt("Please enter your username: ").trim();
        var room = prompt("Please enter a room name: ").trim();
    } catch (e) {
        alert("You must enter a room and name");
        document.location.reload();
    }
    // Get notification permissions
    Notification.requestPermission();

    // Initialize variables
    var lastMessageUser = "";

    // Initialize socket.io server connection
    const socket = io("https://core.techproservices.repl.co", {
        transports: ['websocket', 'polling']
    });
    socket.on("connect", function() {
        console.log("Socket Connected");
        socket.emit("join", {
            username: user,
            ua: navigator.userAgent,
            room: room
        });
    });
    socket.on("log", function(data) {
        console.log("New user: " + data.ua);
    });

    // Handle messages that user sends
    function handleMessage() {
        let message = textinput.value;
        if (message != "") {
            textinput.value = "";
            socket.emit("message", message);
            let HTMLmessage = document.createElement('div');
            HTMLmessage.classList = "message from-me";
            if (lastMessageUser != user) {
                HTMLmessage.innerHTML = `<div class="message-sender">${user}</div>${message}`;
            } else {
                HTMLmessage.innerText = message;
                HTMLmessage.classList += " messageBelow";
            }
            chat.insertAdjacentElement('beforeEnd', HTMLmessage).scrollIntoView();
            lastMessageUser = user;
        } else {
            alert("Please enter a message first.");
        }
    }

    // Handle messages that user receives
    socket.on('message', function(data) {
        let {username, message} = data;
        console.log(`Received ${message} from ${username}`);
        let HTMLmessage = document.createElement('div');
        HTMLmessage.classList = "message from-other";
        if (lastMessageUser != username) {
            HTMLmessage.innerHTML = `<div class="message-sender">${username}</div>${message}`;
        } else {
            HTMLmessage.innerHTML = message;
            HTMLmessage.classList += " messageBelow";
        }
        chat.insertAdjacentElement('beforeEnd', HTMLmessage).scrollIntoView();
        if(document.visibilityState !== 'visible'){
        title.text = "(1) TechPro Connect";
        let n = new Notification(username + ' · TechPro Connect', {icon: '/Images/logo_new.png', body: message});
        document.addEventListener('visibilitychange', function() {
            if(document.visibilityState === 'visible'){
                n.close();
                title.text = "TechPro Connect";
            }
        });
        }
        chime.pause();
        chime.currentTime = 0;
        chime.play();
        lastMessageUser = username;
    });

    // Handle system messages
    socket.on('system-message', function(data) {
        console.log(`System message: ${data}`);
        let HTMLmessage = document.createElement('div');
        HTMLmessage.classList = "system-message";
        HTMLmessage.innerText = data;
        chat.insertAdjacentElement('beforeEnd', HTMLmessage).scrollIntoView();
        lastMessageUser = 'system';
    });

    // Get DOM objects
    var chat = document.getElementById("chat");
    var textinput = document.getElementById("textinput");
    var textsubmit = document.getElementById("textsubmit");
    var chime = document.getElementById("chime");
    var title = document.querySelector("title");

    // Respond to user submitting message
    textsubmit.addEventListener('click', handleMessage);
    textinput.addEventListener('keydown', function(e) {
        switch (e.key) {
        case "Enter":
            handleMessage();
            break;
        default:
            break;
        }
    });
}