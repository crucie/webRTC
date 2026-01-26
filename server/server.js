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

        io.to(room).emit("User Joined", {email, id: socket.id});
        socket.join(room);


        io.to(socket.id).emit('join:room', data) //push user in the room
    });
});



server.listen(3000, () => {
    console.log("Server running on port 3000")
});