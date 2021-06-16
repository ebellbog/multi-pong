const WebSocket = require('ws');
const shared = require('./shared.js');
const server = new WebSocket.Server({
  port: 9001,
});

const gameState = {
    players: [
        // playerId: {
        //     socket: socket,
        //     paddlePosition: 0.1,
        //     paddleColor: '00aabb',
        //     isActive: false,
        // },
    ],
    ball: {
        position: [0, 0],
        direction: 1,
    },
    isStarted: false,
};

server.on('connection', function(socket) {
    console.log('connected');

    socket.on('message', function(msg) {
        console.log(msg);
        msg = JSON.parse(msg);

        if (msg.type === shared.MSG_TYPE.JOIN) {
            if (gameState.isStarted) {
                return; // Send message back? Queue for next game?
            }
            const playerId = msg.playerId;
            gameState.players.push({
                playerId,
                socket,
            });
            sendToAllClients(shared.MSG_TYPE.JOINED);
        }

        if (msg.type === shared.MSG_TYPE.START) {
            gameState.isStarted = True;
            sendToAllClients(shared.MSG_TYPE.STARTED);
        }
    });

    // startGame();
});

const sendToAllClients = (msg) => {
    gameState.players.forEach((player) => {
        player.socket.send(msg);
    });
};

const startGame = () => {
    gameState.ball = {
        position: [0, 0],
        direction: 1,
    }

    gameLoop();
};

const gameLoop = () => {
    console.log('game loop');
    updateBallPosition(gameState);
    sendOutPositions();
    setTimeout(gameLoop, 100);
};

const updateBallPosition = () => {

};