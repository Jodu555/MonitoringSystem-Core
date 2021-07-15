const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { router: auth, setDatabase: auth_setDatabase } = require('./routes/auth');
const { jsonSuccess, jsonError } = require('./utils/jsonMessages');
const dotenv = require('dotenv').config();
const Database = require('./database/Database');
const authManager = require('./utils/authManager');
const messagingManager = require('./utils/messagingManager');


const database = new Database();
database.connect();

auth_setDatabase(database);

const app = express();
const server = http.createServer(app);

const io = new Server(server);

messagingManager.setIO(io);

app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());


app.use('/auth', auth);

app.get('/', authManager.authentication, (req, res) => {
    res.json(jsonSuccess('Basic Auth API works just fine!'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Express App Listening on PORT`);
});
