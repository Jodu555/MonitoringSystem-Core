const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();

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


    if (!clients.has(socket.id)) {
        clients.set(socket.id, {
            socket: socket,
            socketID: socket.id,
            socketIP: socket.handshake.address,
            serverUUID: '',
        });
        socket.emit('auth', true);
    }
}


module.exports = {
    setupForClient,
}