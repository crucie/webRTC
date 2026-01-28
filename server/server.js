const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app=express();
const server = http.createServer(app);


const io = socketIO(server, {
  cors: {
    origin: "*"

  }
});

// Serve static files from public directory
app.use(express.static('../public'));
// console.log(server);


const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();


io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);
    socket.on('join:room', data => {
        const {email, room} = data

        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        io.to(room).emit("user:joined", {email, id: socket.id});
        socket.join(room);


        io.to(socket.id).emit('join:room', data) //push user in the room
    });

    socket.on('user:call', ({ to, offer }) => {
      io.to(to).emit('incoming:call', { from: socket.id, offer})
    })

    socket.on('call:accepted', ({to, ans}) => {
      io.to(to).emit("call:accepted", {from: socket.id, ans})

    })

    socket.on('peer:nego:needed', ( {to, offer}) => {
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer})
    })

    socket.on('peer:nego:done', ({to, ans}) => {
      io.to(to).emit("peer:nego:final", {from:socket.id, offer});
    })
});



server.listen(3000, () => {
    console.log("Server running on port 3000")
});