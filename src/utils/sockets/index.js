const { setupForSlave } = require('./slave');

// const slave_lookup_IPS = new Map();
// const slaves = new Map();


let io = null;
function setup(_io) {
    io = _io;
    startListening();
}


function startListening() {

    io.on('connection', (socket) => {
        console.log('Client Connected');
        socket.on('type', (data) => {
            if (data.type == 'slave')
                setupForSlave(socket);
            // if (data.type == 'client')
            // setupForClient(socket);
        });
    });

}

module.exports = {
    setup
};