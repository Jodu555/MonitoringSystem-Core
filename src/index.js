const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

const PERSISTENT_DataInterval = 60 * 10 * 1000; //1 Hour
const CHANGE_DataInterval = 10 * 1000; //1 Minute
const PERSISTENT_DATA = 'PERSISTENT_DATA';
const CHANGE_DATA = 'CHANGE_DATA';


const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.json({
        message: 'Monitoring API works just fine!',
    })
});






const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Express App Listening on PORT`);
});