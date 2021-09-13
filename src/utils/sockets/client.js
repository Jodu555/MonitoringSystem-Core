const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();

const clients = new Map();

function setupForClient(socket) {

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clients.delete(socket.id);
    });



    if (!clients.has(socket.id)) {
        console.log(socket.id);
        clients.set(socket.id, {
            socket: socket,
            socketID: socket.id,
            socketIP: socket.handshake.address,
            serverUUID: '',
        });
    }
}


module.exports = {
    setupForClient,
}