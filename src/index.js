const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv').config();
const { Database } = require('@jodu555/mysqlapi');
const database = Database.createDatabase(process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_DATABASE);
database.connect();
require('./utils/tables').createTables();

const { router: auth } = require('./routes/auth/index');
const { router: serv } = require('./routes/server/index');
const { router: data } = require('./routes/data/index');
const { jsonSuccess, jsonError } = require('./utils/jsonMessages');
const messagingManager = require('./utils/sockets/index');
const authManager = require('./utils/authManager');
authManager.addToken('SECRET-DEV-KEY', {
    UUID: '245aa5b8-7ddb-492b-8be1-e8d51b421dbf',
})

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
messagingManager.setup(io);

app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

//TODO: Think about if all the client server communication should run over the sockets or if the initial data gets loaded by the HTTP routes

app.use('/auth', auth);
app.use('/server', authManager.authentication, serv);
app.use('/data', authManager.authentication, data);

app.get('/', authManager.authentication, (req, res) => {
    res.json(jsonSuccess('Basic Auth API works just fine!'));
});

const PORT = process.env.PORT || 3100;
server.listen(PORT, async () => {
    console.log(`Express App Listening on ${PORT}`);
});
