const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 9001
});

server.on('connection', function(socket) {
    console.log('connected');

    socket.on('message', function(msg) {
        console.log('got message ' + msg);
    });
});
