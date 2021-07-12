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
        console.log(socket);
        console.log('A client connected');
        socket.on('disconnect', () => {
            clients.delete(socket.id);
        });
        socket.on('data', (data) => {
            if (data.type == PERSISTENT_DATA) {
                console.log('Persistent:', data);
            } else {
                console.log('Change:', data);
            }
        });


        if (!lookup_IPS.has(socket.remoteAddress)) {
            lookup_IPS.set(socket.remoteAddress, socket);
            clients.set(socket.id, {
                socketID: socket.id,
                socketIP: socket.remoteAddress,
                serverUUID: null,
            });
        }
    });
}


setInterval(() => {
    clients.forEach((socket, info) => {
        socket.emit('action', PERSISTENT_DATA);
    });
}, PERSISTENT_DataInterval);

setInterval(() => {
    clients.forEach((socket, info) => {
        socket.emit('action', CHANGE_DATA);
    });
}, CHANGE_DataInterval);

module.exports = {
    setIO
};