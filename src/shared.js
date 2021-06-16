const MSG_TYPE = {
    // Client -> server
    JOIN: 'join', // Player wants to join
    START: 'start', // Request to start game

    // Server -> client
    JOINED: 'joined', // Player has joined
    STARTED: 'started', // Game has started
};

module.exports = {MSG_TYPE};