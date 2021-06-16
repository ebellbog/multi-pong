const WebSocket = require('ws');
const shared = require('./shared.js');
const server = new WebSocket.Server({
  port: 9001,
});

const gameState = {
    // Map of playerId -> {socket}
    players: {},
    ball: {
        position: [0, 0],
        direction: 1,
    },
    isStarted: false,
};

server.on('connection', function(socket) {
    socket.on('message', (msg) => {
        msg = JSON.parse(msg);

        if (msg.type === shared.MSG_TYPE.JOIN) {
            if (gameState.isStarted) {
                return; // Send message back? Queue for next game?
            }
            const playerId = msg.playerId;
            gameState.players[playerId] = {
                socket,
            };
            sendToAllClients(shared.MSG_TYPE.JOINED);
        }

        if (msg.type === shared.MSG_TYPE.START) {
            gameState.isStarted = true;
            sendToAllClients(shared.MSG_TYPE.STARTED);
        }
    });

    socket.on('close', () => {
        console.log('socket closing');
        let closingPlayerId = null;
        for (const playerId in gameState.players) {
            if (gameState.players[playerId].socket === socket) {
                closingPlayerId = playerId;
                console.log('found closing player' + closingPlayerId);
            }
        }
        if (closingPlayerId) {
            delete gameState.players[closingPlayerId];
        }
    });

    // startGame();
});

const sendToAllClients = (msg) => {
    console.log(gameState);
    for (const playerId in gameState.players) {
        console.log(`sending msg "${msg}" to player with id ${playerId}`);
        gameState.players[playerId].socket.send(msg);
    }
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
    // sendOutPositions();
    setTimeout(gameLoop, 100);
};

const updateBallPosition = () => {

};