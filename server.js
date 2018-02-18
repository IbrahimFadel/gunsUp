const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.static('gunsUpDir'));

app.get('/', (req, res, next) => {
    //res.sendFile(path.join(__dirname + '/index.html'));
    res.sendFile(__dirname + '/pub/gunsUp.html');
});

app.get('/server.js', (req, res, next) => {
    res.sendFile(__dirname + '/pub/server.js');
});

app.get('/gunsUp.js', (req, res, next) => {
    res.sendFile(__dirname + '/pub/gunsUp.js');
});

app.get('/phaser.js', (req, res, next) => {
    res.sendFile(__dirname + '/pub/phaser.js');
});

app.get('/socket.io.js', (req, res, next) => {
    res.sendFile(__dirname + '/pub/socket.io.js');
});

app.get('/assets/bullet153.png', (req, res, next) => {
    res.sendFile(__dirname + '/pub/assets/bullet153.png');
});

app.get('/assets/playerSpriteSheet.png', (req, res, next) => {
    res.sendFile(__dirname + '/pub/assets/playerSpriteSheet.png');
});

app.get('/assets/wall.png', (req, res, next) => {
    res.sendFile(__dirname + '/pub/assets/wall.png');
});

/*app.listen(PORT, () => {
    //console.log('Server listening on port %s', PORT);
});*/


const server = require('http').Server(app);
const io = require('socket.io').listen(server);

let arrayOfPlayers = [];

server.listen(PORT, () => { // Listens to port 8081
    console.log('Listening on '+server.address().port);
});

io.on('connection', (socket) => {
    socket.on('newplayer', (data) => {
        console.log("a new player joined the game")
        console.log(data)
        arrayOfPlayers.push(data);
        socket.emit('allplayers', arrayOfPlayers);
        socket.broadcast.emit('newplayer', data);
    });
});