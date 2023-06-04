import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

console.log(__dirname);

const app = express();
const url = require('url');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');

app.get('/', (req, res) => {
  console.log('get:chatClient.html');
  res.sendFile('chatClient.html', { root: __dirname });
});

app.use((req, res) => {
  const fileName = url.parse(req.url).pathname.replace('/', '');
  res.sendFile(fileName, { root: __dirname });
  console.log('use:', fileName);
});

const server = require('http').createServer(app);
server.listen(3000);
console.log('listening at http://127.0.0.1:3000...');

const uniqueID = (() => {
  let id = localStorage.getItem('user') || 0;
  return () => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', ++id);
    }
    return id;
  };
})();

const socket = require('socket.io')(server);

socket.sockets.on('connection', (socketClient) => {
  const clientID = uniqueID();
  console.log('Connection: ' + clientID);

  socketClient.on('serverReceiver', (value) => {
    socket.sockets.emit('clientReceiver', {
      clientID: clientID,
      message: value,
    });
  });
});
