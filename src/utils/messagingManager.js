const PERSISTENT_DataInterval = 60 * 10 * 1000; //1 Hour
const CHANGE_DataInterval = 10 * 1000; //1 Minute
const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

const lookup_IPS = new Map();
const clients = new Map();

let io = null;
function setIO(_io) {
    io = _io;
    startListening();
}

function startListening() {
    io.on('connection', (socket) => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            lookup_IPS.delete(socket.handshake.address);
            clients.delete(socket.id);
        });

        socket.on('data', (data) => {
            if (data.type == PERSISTENT_DATA) {
                console.log('Persistent:', data);
            } else {
                console.log('Change:', data);
            }
        });

        socket.on('auth', (data) => {
            if (data.auth_token) {
                const servers = await database.getServer.get({ authorization_key: auth_token });
                if (servers.length > 1) {
                    clients.get(socket.id).serverUUID = servers[0].UUID;
                    socket.emit('auth', true);
                }
            } else {
                socket.emit('auth', false);
            }
        });

        if (!lookup_IPS.has(socket.handshake.address)) {
            lookup_IPS.set(socket.handshake.address, socket);
            clients.set(socket.id, {
                socket: socket,
                socketID: socket.id,
                socketIP: socket.handshake.address,
                serverUUID: null,
            });
        }
    });

    setInterval(() => {
        clients.forEach((info, id) => {
            info.socket.emit('action', PERSISTENT_DATA);
        });
    }, PERSISTENT_DataInterval);

    setInterval(() => {
        clients.forEach((info, id) => {
            info.socket.emit('action', CHANGE_DATA);
        });
    }, CHANGE_DataInterval);

}

module.exports = {
    setIO
};