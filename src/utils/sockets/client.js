const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();
const authManager = require('./utils/authManager');

const clients = new Map();


function setupForClient(socket) {
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clients.delete(socket.id);
    });

    //Emits when a player changes the server view
    socket.on('subscribe', (data) => {
        clients.get(socket.id).serverUUID = data.serverUUID;
    });

    socket.on('auth', (data) => {
        const user = authManager.getUser(data.token);
        if (user) {
            clients.get(socket.id).authenticated = true;
            clients.get(socket.id).auth_token = data.token;
            clients.get(socket.id).user = user;
        } else {
            socket.emit('auth', false);
        }
    });

    if (!clients.has(socket.id)) {
        clients.set(socket.id, {
            socket: socket,
            socketID: socket.id,
            socketIP: socket.handshake.address,
            serverUUID: '',
            authenticated: false,
            auth_token: '',
            user: null,
        });
    } else {
        socket.emit('auth', false);
    }
}


module.exports = {
    setupForClient,
}