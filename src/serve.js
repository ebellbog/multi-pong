const WebSocket = require('ws');
const shared = require('./shared.js');
const _ = require('lodash');

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

const paddleSpeed = .05;

const notifyPlayers = () => {
    sendToAllClients(JSON.stringify({
        type: shared.MSG_TYPE.JOINED,
        players: Object.keys(gameState.players)
    }));
}

server.on('connection', function (socket) {
    socket.on('message', (msg) => {
        msg = JSON.parse(msg);

        if (msg.type === shared.MSG_TYPE.JOIN) {
            if (gameState.isStarted) {
                return; // Send message back? Queue for next game?
            }
            const playerId = msg.playerId;
            gameState.players[playerId] = {
                socket,
                paddlePosition: 0.5,
            };
            notifyPlayers();
        }

        if (msg.type === shared.MSG_TYPE.START) {
            gameState.isStarted = true;
            sendToAllClients(JSON.stringify({
                type: shared.MSG_TYPE.STARTED,
                ball: {
                    angle: Math.random() * Math.PI * 2,
                },
            }));
        }

        if (msg.type === shared.MSG_TYPE.MOVE) {
            const { playerId, direction } = msg;
            gameState.players[playerId].paddlePosition += direction * paddleSpeed;
            sendToAllClients(JSON.stringify({
                type: shared.MSG_TYPE.PADDLEPOSITIONS,
                paddlePositions: gameState.players,//Object.keys(gameState.players).reduce((acc, key) => acc[key] = _.pick(gameState.players[key], ['paddlePosition']), {})
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
            gameState.isStarted = false; // Game should end if a player leaves
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