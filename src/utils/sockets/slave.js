const PERSISTENT_DataInterval = 60 * 10 * 1000; //1 Hour
const CHANGE_DataInterval = 1 * 10 * 1000; //1 Minute
const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';

const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();

const slaves = new Map();

let callFun = null;

setInterval(() => {
    slaves.forEach((info, id) => {
        info.socket.emit('action', PERSISTENT_DATA);
    });
}, PERSISTENT_DataInterval);

setInterval(() => {
    slaves.forEach((info, id) => {
        info.socket.emit('action', CHANGE_DATA);
    });
}, CHANGE_DataInterval);

function setupForSlave(socket) {
    socket.on('disconnect', () => {
        console.log('Slave disconnected');
        slaves.delete(socket.id);
    });

    socket.on('data', (data) => { dataIncome(socket, data); });

    socket.on('auth', async (data) => {
        if (data.auth_token) {
            const servers = await database.get('server').get({ authorization_key: data.auth_token });
            if (servers.length > 0) {
                slaves.get(socket.id).serverUUID = servers[0].UUID;
                slaves.get(socket.id).authenticated = true;
                socket.emit('auth', true);
                socket.emit('action', PERSISTENT_DATA);
            }
        } else {
            socket.emit('auth', false);
        }
    });

    if (!slaves.has(socket.id)) {
        slaves.set(socket.id, {
            socket: socket,
            socketID: socket.id,
            socketIP: socket.handshake.address,
            serverUUID: null,
            authenticated: false,
        });
    } else {
        socket.emit('auth', false);
    }
}

async function dataIncome(socket, data) {
    if (!slaves.get(socket.id).authenticated) {
        socket.emit('auth', false);
        return
    }
    const server = await database.get('server').getOne({ UUID: slaves.get(socket.id).serverUUID });
    if (!server) {
        return;
    }
    if (data.type == PERSISTENT_DATA) {
        const datas = await database.get('data').get({ UUID: server.data_UUID });
        if (datas.length > 0) {
            const obj = persistentDataToDatabaseModel(data);
            delete obj.uptime;
            await database.get('data').update({ UUID: server.data_UUID }, obj);
        } else {
            const obj = persistentDataToDatabaseModel(data);
            obj.UUID = server.data_UUID;
            await database.get('data').create(obj);
        }
    } else if (data.type == CHANGE_DATA) {
        const obj = changeDataToDatabaseModel(data);
        obj.server_UUID = server.UUID;
        await database.get('log').create(obj);
        await database.get('data').update({ UUID: server.data_UUID }, { uptime: data.uptime });
    }
    callFun(server);
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

function setCallFunction(fn) {
    callFun = fn;
}

module.exports = {
    setupForSlave,
    setCallFunction,
}