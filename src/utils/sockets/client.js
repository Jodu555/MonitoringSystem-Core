const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();
const authManager = require('../authManager');
const slave = require('./slave');
const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

const clients = new Map();

//TODO: Fill this function with function
// -> It gets called when a slave publishes a change for a server if its persistent or change DATA
// -> The server object wich gets passed into is the object from the database
slave.setCallFunction((server, data) => {
    clients.forEach((client, socketId) => {
        if (client.authenticated && client.serverUUID == server.UUID) {
            client.socket.emit('change', { server, data });
        }
    });
});

function getLatestLogData(uuid) {
    const query = 'SELECT * FROM log WHERE SERVER_UUID=? ORDER BY time DESC LIMIT 1';
    return new Promise(async (resolve, reject) => {
        await database.connection.query(query, [uuid], async (error, results, fields) => {
            if (error)
                throw error;
            if (results.length == 0) resolve(null);
            await results.forEach((result) => {
                resolve(result);
            });
        });
    });
}

async function sendFirstTimeData(socket, server) {
    const data = await database.get('data').getOne({ UUID: server.data_UUID });
    const log = await getLatestLogData(server.UUID);
    data.type = PERSISTENT_DATA;
    log.type = CHANGE_DATA;
    socket.emit('change', { server, data: [data, log] });
}

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
            sendMsg(socket, false, 'You Successfully subscribed to the Server!');
            sendFirstTimeData(socket, server)
        } else {
            sendMsg(socket, true, 'You dont own this Server!')
        }
    });

    socket.on('auth', (data) => {
        const user = authManager.getUser(data.token);
        if (user) {
            clients.get(socket.id).authenticated = true;
            clients.get(socket.id).auth_token = data.token;
            clients.get(socket.id).user = user;
            socket.emit('auth', true)
            sendMsg(socket, false, 'Scuccessfully authenticated!');
        } else {
            socket.emit('auth', false);
            sendMsg(socket, false, 'Error whilst Authentication!');
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

function sendMsg(socket, error, msg) {
    socket.emit('message', { type: error ? 'error' : 'success', msg });
}


module.exports = {
    setupForClient,
}