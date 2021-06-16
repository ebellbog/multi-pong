const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 9001
});

let sockets = [];
server.on('connection', function(socket) {
    console.log('connected');
    sockets.push(socket);

    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg) {
        console.log('got message ' + msg);
    });

    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
    });
});
