const { setupForSlave } = require('./slave');
const { setupForClient } = require('./client');

let io = null;
function setup(_io) {
    io = _io;
    startListening();
}


function startListening() {

    io.on('connection', (socket) => {
        console.log('Client/Slave Connected: ');
        socket.on('type', (data) => {
            console.log('- ' + data.type);
            if (data.type == 'slave')
                setupForSlave(socket);
            if (data.type == 'client')
                setupForClient(socket);
        });
    });

}

module.exports = {
    setup
};