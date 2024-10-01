const serverWebSocketAddr = "http://localhost:8080/ws"
const socket = new WebSocket(serverWebSocketAddr)

var lastTime, lastState;
var currentRoomId = '';
var isMaster;

function isInRoom() {
    return currentRoomId.length > 1;
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const userId = makeid(12)

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type) {
        case 'requestState':
            browser.runtime.sendMessage({ type: 'onReloadState', state: lastState, time: lastTime, roomId: currentRoomId });
            break
        case 'onPlay':
            lastState = 'PLAYING'
            break;
        case 'onPause':
            lastState = 'PAUSED'
            break;
        case 'onTimeUpdate':
            lastTime = message.time
            if(isInRoom() && isMaster)
                socket.send("sync " + userId + " " + lastTime)
            break;

        case 'netJoinRoom':
            let roomId = message.roomId;
            socket.send("joinRoom " + userId + " " + roomId)
            isMaster = false
            console.log('isMaster = false')
            break;
        case 'netCreateRoom':
            isMaster = true
            console.log('isMaster = true')
            socket.send("createRoom " + userId)
            break;
    }

    browser.runtime.sendMessage(message);
});

// Connection opened
socket.addEventListener("open", (event) => {
    console.log("Connection opened");
    socket.send("ping " + userId);
});
  
function sendToActiveTab(message) {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length > 0) {
            const activeTabId = tabs[0].id;
            browser.tabs.sendMessage(activeTabId, message);
        }
    });
}

// Listen for messages
socket.addEventListener("message", (event) => {
    let spl = event.data.toString().split(' ')

    switch(spl[0]) {
        case 'joinedToRoom':
            let roomId = spl[1]
            currentRoomId = roomId
            browser.runtime.sendMessage({ type: 'onReloadState', state: lastState, time: lastTime, roomId: currentRoomId });
            break;

        case 'syncSlave':
            let time = parseFloat(spl[1])
            console.log('syncSlave ' + time)
            sendToActiveTab({ type: 'setPlayerTime', time: time });
            break;

        default:
            console.log("Undefined message from server ", event.data);
            break
    }
});