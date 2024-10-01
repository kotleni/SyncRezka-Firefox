document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnCreateRoom').addEventListener('click', () => {
        console.log('btnCreateRoom')
        browser.runtime.sendMessage({ type: 'netCreateRoom' });
    });

    document.getElementById('btnJoinRoom').addEventListener('click', () => {
        let roomId = document.getElementById('roomIdField').value
        console.log('btnJoinRoom')
        browser.runtime.sendMessage({ type: 'netJoinRoom', roomId: roomId });
    });
    
    browser.runtime.sendMessage({ type: 'requestState' });
})

browser.runtime.onMessage.addListener((message) => {
    console.log(message)

    switch(message.type) {
        case 'onTimeUpdate':
            document.getElementById('time').textContent = message.time;
            break;
        case 'onPlay':
            document.getElementById('state').textContent = 'PLAYING';
            break
        case 'onPause':
            document.getElementById('state').textContent = 'PAUSED';
            break
        case 'onReloadState':
            document.getElementById('state').textContent = message.state;
            document.getElementById('time').textContent = message.time;
            document.getElementById('roomId').textContent = message.roomId;
            break
    }
})