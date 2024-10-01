(function() {
    'use strict';

    function handleVideo(video) {
        if (video) {
            console.log("Video element found, attaching pause listener.");
            video.ontimeupdate = (event) => { 
                browser.runtime.sendMessage({ type: 'onTimeUpdate', time: video.currentTime });
            };
            video.onplaying = (event) => { 
                browser.runtime.sendMessage({ type: 'onPlay', time: video.currentTime });
            };
            video.onpaused = (event) => { 
                browser.runtime.sendMessage({ type: 'onPause', time: video.currentTime });
            };
        }
    }

    // Try to attach the event listener immediately if the video is already in the DOM
    let video = document.getElementsByTagName("video")[0];
    handleVideo(video);

    // Use MutationObserver to monitor the DOM for dynamically added video elements
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName && node.tagName.toLowerCase() === 'video') {
                        handleVideo(node);
                    }
                });
            }
        });
    });

    // Start observing the document for changes in the child nodes
    observer.observe(document.body, { childList: true, subtree: true });

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch(message.type) {
            case 'setPlayerTime':
                console.log('setPlayerTime' + message.time)
                const allowedDifference = 1.0
                let difference = Math.abs(video.currentTime - message.time);
                if(difference > allowedDifference)
                    video.currentTime = message.time;
                break;
        }
    });
})();
