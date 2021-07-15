const PERSISTENT_DataInterval = 60 * 10 * 1000; //1 Hour
const CHANGE_DataInterval = 1 * 10 * 1000; //1 Minute
const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

const lookup_IPS = new Map();
const clients = new Map();

let io = null;
let database = null;
function setup(_io, _database) {
    io = _io;
    database = _database;
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

        socket.on('data', async (data) => {
            const servers = await database.getServer.get({ UUID: clients.get(socket.id).serverUUID });
            if (!servers.length > 0) {
                return;
            }
            const server = servers[0];
            if (data.type == PERSISTENT_DATA) {

                const datas = await database.getData.get({ UUID: server.data_UUID });
                if (datas.length > 0) {
                    const obj = persistentDataToDatabaseModel(data);
                    delete obj.uptime;
                    await database.getData.update({ UUID: server.data_UUID }, obj);
                } else {
                    const obj = persistentDataToDatabaseModel(data);
                    obj.UUID = server.data_UUID;
                    await database.getData.create();
                }
            } else if (data.type == CHANGE_DATA) {
                console.log('Change:', data);
                const obj = changeDataToDatabaseModel(data);
                obj.server_UUID = server.UUID;
                await database.getLog.create(obj);
                await database.getData.update({ UUID: server.data_UUID }, { uptime: data.uptime });
            }
        });

        socket.on('auth', async (data) => {
            if (data.auth_token) {
                const servers = await database.getServer.get({ authorization_key: data.auth_token });
                if (servers.length > 0) {
                    clients.get(socket.id).serverUUID = servers[0].UUID;
                    socket.emit('auth', true);
                    socket.emit('action', PERSISTENT_DATA);
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
                serverUUID: '',
            });
        } else {
            socket.emit('auth', false);
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

function changeDataToDatabaseModel(data) {

    return {
        time: Date.now(),
        used_memory: data.memory.current,
        max_memory: data.memory.total,
        cpu_usage: data.cpu
    }
}

function persistentDataToDatabaseModel(data) {
    return {
        hostname: data.host.hostname,
        uptime: 0,
        platform: data.host.platform,
        platform_type: data.host.platformType,
        username: data.host.username,
        homedir: data.host.homedir,
        ips: JSON.stringify(data.ips),
    };
}

module.exports = {
    setup
};