var connection = new RTCMultiConnection();
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

const publicRoomIdentifier = 'videoCode';
connection.publicRoomIdentifier = publicRoomIdentifier;
connection.autoCloseEntireSession = true;
connection.connectSocket(function(socket) {});
// connection.mediaConstraints = {
//     audio: true,
//     video: false
// };

connection.session = {
    audio: true,
    video: false,
    data: true // Para habilitar chat
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};
// connection.mediaConstraints = { AUDIO
//     audio: true,
//     video: false
// };



connection.iceServers = [{
    'urls': [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
    ]
}];



function join(roomName, user, video) {
    // Room Users
    connection.sessionid = roomName;
    connection.extra.userFullName = user.usuario;
    connection.extra.userPhoto = user.photo;
    connection.isInitiator = false;
    connection.openOrJoin(roomName);
    connection.onUserStatusChanged(null);
}


connection.onUserStatusChanged = function(event) {
    var infoBar = document.getElementById('onUserStatusChanged');
    var names = [];
    connection.getAllParticipants().forEach(function(pid) {
        names.push(getFullName(pid));
    });

    if (!names.length) {
        names = ['Tú'];
    } else {
        names = [connection.extra.userFullName || 'Tú'].concat(names);
    }

    // infoBar.innerHTML = '<b>Usuarios dentro:</b> ' + names.join(', ');
};



connection.onmessage = function(event) {
    if (event.data.chatMessage) {
        appendChatMessage(event);
        return;
    }
}

function appendChatMessage(event, checkmark_id) {
    // Position
    var conversationPanel = document.getElementById('conversation-panel');
    var positionChat = document.createElement('div');
    positionChat.classList.add('chat-widget-speaker');

    

    // Messages
    var messageText = document.createElement('p');
    messageText.classList.add('chat-widget-speaker-message');

    if (event.data) { // Si no es el usuario conectado quien envio el mensaje
        positionChat.classList.add('left');
        messageText.textContent = `${event.extra.userFullName}: ${event.data.chatMessage}`;
    } else {
        positionChat.classList.add('right');
        messageText.textContent = `Tú: ${event}`;
    }
    

    // Secondary

    if (event.data) { // Si no es el usuario conectado quien envio el mensaje
        var avatarDiv = document.createElement('div');
        avatarDiv.classList.add('chat-widget-speaker-avatar');
        avatarDiv.style.background = `url(${event.extra.userPhoto})`;
        avatarDiv.style.backgroundRepeat = 'no-repeat';
        avatarDiv.style.backgroundSize = 'cover';
        avatarDiv.style.borderRadius = '100%';
        positionChat.appendChild(avatarDiv);

        
        // Secondary
        var avatarDivSec = document.createElement('div');
        avatarDivSec.classList.add('user-avatar');
        avatarDivSec.classList.add('tiny');
        avatarDivSec.classList.add('no-border');
        avatarDiv.appendChild(avatarDivSec);
    }




    positionChat.appendChild(messageText);
    conversationPanel.appendChild(positionChat);
}







function getFullName(userid) {
    var _userFullName = userid;
    if (connection.peers[userid] && connection.peers[userid].extra.userFullName) {
        _userFullName = connection.peers[userid].extra.userFullName;
    }
    return _userFullName;
}




async function getRoomsStats() {
    return new Promise((resolve) => {
        connection.socket.emit('get-public-rooms', publicRoomIdentifier, resolve);
    });
}



function sendMessage(chatMessage) {
    const checkmark_id = connection.userid + connection.token();
    appendChatMessage(chatMessage, checkmark_id);
    connection.send({
        chatMessage: chatMessage,
        checkmark_id: checkmark_id
    });

    connection.send({
        typing: false
    });
    document.getElementById('chat-widget-message-text-2').value = '';

    
}



/*
getScreenId(function (error, sourceId, screen_constraints) {
    if(microsoftEdge) {
        navigator.getDisplayMedia(screen_constraints).then(onSuccess, onFailure);
    }
    else {
        navigator.mediaDevices.getUserMedia(screen_constraints).then(onSuccess)catch(onFailure);
    }

}, 'pass second parameter only if you want system audio');*/

(function() {
    window.getScreenId = function(callback, custom_parameter) {
        if(navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob)) {
            // microsoft edge => navigator.getDisplayMedia(screen_constraints).then(onSuccess, onFailure);
            callback({
                video: true
            });
            return;
        }

        // for Firefox:
        // sourceId == 'firefox'
        // screen_constraints = {...}
        if (!!navigator.mozGetUserMedia) {
            callback(null, 'firefox', {
                video: {
                    mozMediaSource: 'window',
                    mediaSource: 'window'
                }
            });
            return;
        }

        window.addEventListener('message', onIFrameCallback);

        function onIFrameCallback(event) {
            if (!event.data) return;

            if (event.data.chromeMediaSourceId) {
                if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                    callback('permission-denied');
                } else {
                    callback(null, event.data.chromeMediaSourceId, getScreenConstraints(null, event.data.chromeMediaSourceId, event.data.canRequestAudioTrack));
                }

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }

            if (event.data.chromeExtensionStatus) {
                callback(event.data.chromeExtensionStatus, null, getScreenConstraints(event.data.chromeExtensionStatus));

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        }

        if(!custom_parameter) {
            setTimeout(postGetSourceIdMessage, 100);
        }
        else {
            setTimeout(function() {
                postGetSourceIdMessage(custom_parameter);
            }, 100);
        }
    };

    function getScreenConstraints(error, sourceId, canRequestAudioTrack) {
        var screen_constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: error ? 'screen' : 'desktop',
                    maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                    maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                },
                optional: []
            }
        };

        if(!!canRequestAudioTrack) {
            screen_constraints.audio = {
                mandatory: {
                    chromeMediaSource: error ? 'screen' : 'desktop',
                    // echoCancellation: true
                },
                optional: []
            };
        }

        if (sourceId) {
            screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;

            if(screen_constraints.audio && screen_constraints.audio.mandatory) {
                screen_constraints.audio.mandatory.chromeMediaSourceId = sourceId;
            }
        }

        return screen_constraints;
    }

    function postGetSourceIdMessage(custom_parameter) {
        if (!iframe) {
            loadIFrame(function() {
                postGetSourceIdMessage(custom_parameter);
            });
            return;
        }

        if (!iframe.isLoaded) {
            setTimeout(function() {
                postGetSourceIdMessage(custom_parameter);
            }, 100);
            return;
        }

        if(!custom_parameter) {
            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }
        else if(!!custom_parameter.forEach) {
            iframe.contentWindow.postMessage({
                captureCustomSourceId: custom_parameter
            }, '*');
        }
        else {
            iframe.contentWindow.postMessage({
                captureSourceIdWithAudio: true
            }, '*');
        }
    }

    var iframe;

    // this function is used in RTCMultiConnection v3
    window.getScreenConstraints = function(callback) {
        loadIFrame(function() {
            getScreenId(function(error, sourceId, screen_constraints) {
                if(!screen_constraints) {
                    screen_constraints = {
                        video: true
                    };
                }

                callback(error, screen_constraints.video);
            });
        });
    };

    function loadIFrame(loadCallback) {
        if (iframe) {
            loadCallback();
            return;
        }

        iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            loadCallback();
        };
        iframe.src = 'https://www.webrtc-experiment.com/getSourceId/'; // https://wwww.yourdomain.com/getScreenId.html
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    }

    window.getChromeExtensionStatus = function(callback) {
        // for Firefox:
        if (!!navigator.mozGetUserMedia) {
            callback('installed-enabled');
            return;
        }

        window.addEventListener('message', onIFrameCallback);

        function onIFrameCallback(event) {
            if (!event.data) return;

            if (event.data.chromeExtensionStatus) {
                callback(event.data.chromeExtensionStatus);

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        }

        setTimeout(postGetChromeExtensionStatusMessage, 100);
    };

    function postGetChromeExtensionStatusMessage() {
        if (!iframe) {
            loadIFrame(postGetChromeExtensionStatusMessage);
            return;
        }

        if (!iframe.isLoaded) {
            setTimeout(postGetChromeExtensionStatusMessage, 100);
            return;
        }

        iframe.contentWindow.postMessage({
            getChromeExtensionStatus: true
        }, '*');
    }
})();

function screenShare() {
    connection.session = {
        screen: true,
        oneway: true,
        audio: false,
        video: false,
        data: true // Para habilitar chat
    };

    connection.mediaConstraints = {
        audio: true,
        video: false
    };
    
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };
    
    connection.openOrJoin('xMf80dATuePTBtURAAAA');
    
}


