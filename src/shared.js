const MSG_TYPE = {
    // Client -> server
    JOIN: 'join', // Player wants to join
    START: 'start', // Request to start game
    END: 'end', // Client has detected a gameover state
    MOVE: 'move', // Move player paddle left or right

    // Server -> client
    JOINED: 'joined', // Player has joined
    STARTED: 'started', // Game has started
    PADDLEPOSITIONS: 'paddle-positions'
};

module.exports = {MSG_TYPE};