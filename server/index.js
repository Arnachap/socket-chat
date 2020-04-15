const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { addUser, removeUser, getUser, getUserInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the room ${user.room} !`,
    });
    socket.broadcast
      .to(user.room)
      .emit('message', {
        user: 'admin',
        text: `${user.name} has joind the chat !`,
      });

    socket.join(user.room);

    callback();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
