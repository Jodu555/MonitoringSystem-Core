const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();
const authManager = require('../authManager');
const slave = require('./slave');

const clients = new Map();

//TODO: Fill this function with function
// -> It gets called when a slave publishes a change for a server if its persistent or change DATA
// -> The server object wich gets passed into is the object from the database
slave.setCallFunction((server) => {

});

function setupForClient(socket) {
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clients.delete(socket.id);
    });

    socket.on('subscribe', async (data) => {
        const server = await database.get('server').getOne({
            unique: true,
            account_UUID: clients.get(socket.id).user.UUID,
            UUID: data.serverUUID,
        });
        if (server) {
            clients.get(socket.id).serverUUID = data.serverUUID;
        } else {
            socket.emit('message', { type: 'error', message: 'You dont own this Server!' });
        }
    });

    socket.on('auth', (data) => {
        const user = authManager.getUser(data.token);
        if (user) {
            clients.get(socket.id).authenticated = true;
            clients.get(socket.id).auth_token = data.token;
            clients.get(socket.id).user = user;
            socket.emit('auth', true)
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