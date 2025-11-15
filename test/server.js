'use strict'
const { Server } = require('ws');
const express = require('express');
const app = express();

app.use('/', express.static('client'));

const httpserver = app.listen(3001, console.log('Server is listening on port 3001'));
const wss = new Server({ noServer: true });

httpserver.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

let clientsCount = 0;
let maxClients = 10;
let balls = [];
let b = new ArrayBuffer(30);
let bf = new Uint16Array(b);

for (let i = 0; i < maxClients; i++) {
    balls.push([0, 0]);
}

wss.on('connection', (ws, request) => {
    let clid = clientsCount += 1;
    if (clid > maxClients - 1) clid = maxClients - 1;

    ws.on('message', (msg) => {
        if (msg.length == 2) {
            if (msg[0] == 0) balls[clid][1] += 4;
            if (msg[0] == 2) balls[clid][1] -= 4;
            if (msg[1] == 0) balls[clid][0] -= 4;
            if (msg[1] == 2) balls[clid][0] += 4;
        }
    });


    ws.on('close', function() {
        balls[clid][0] = 0;
        balls[clid][1] = 0;
        clientsCount -= 1;
    });

    setInterval(() => {
        for (let i = 0; i < balls.length; i++) {
            bf[i * 2] = balls[i][0] - balls[clid][0] + 32768;
            bf[i * 2 + 1] = balls[i][1] - balls[clid][1] + 32768;
        }
        ws.send(bf);
    }, 33.3);
});