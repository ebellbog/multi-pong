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

const notifyPlayers = () => {
    sendToAllClients(JSON.stringify({
        type: shared.MSG_TYPE.JOINED,
        numPlayers: Object.keys(gameState.players).length
    }));
}

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
            notifyPlayers();
        }

        if (msg.type === shared.MSG_TYPE.START) {
            gameState.isStarted = true;
            sendToAllClients(JSON.stringify({
                type:shared.MSG_TYPE.STARTED,
                ball: {
                    angle: Math.random() * Math.PI * 2,
                },
            }));
        }
    });

    // When a player leaves, remove them if game has not started.
    // TODO: If game has started?
    socket.on('close', () => {
        console.log('socket closing');
        let closingPlayerId = null;
        for (let playerId in gameState.players) {
            if (gameState.players[playerId].socket === socket) {
                closingPlayerId = playerId;
                console.log('found closing player' + closingPlayerId);
            }
        }
        if (closingPlayerId) {
            delete gameState.players[closingPlayerId];
            notifyPlayers();
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