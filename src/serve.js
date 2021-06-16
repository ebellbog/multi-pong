const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 9001,
});

const gameState = {
    players: [],
}

server.on('connection', function(socket) {
    console.log('connected');

    gameState.players['a'] = {
        name: 'b',
    }

    socket.on('message', function(msg) {
        console.log('got message ' + msg);
    });

    startGame();
});

const startGame = () => {
    gameState.ball = {
        position: [0, 0],
    }

    gameLoop();
}

const gameLoop = () => {
    console.log('game loop');
    updateBallPosition(gameState);
    setTimeout(gameLoop, 100);
}

const updateBallPosition = () => {

};