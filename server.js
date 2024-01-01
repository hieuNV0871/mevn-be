const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');  // Import từ thư viện socket.io
const route = require('./src/routes');
const db = require('./src/configs/db');

const app = express();

db.connect();

// const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:2000', 'http://localhost:5173', 'http://localhost:5174'];
// const corsOptions = {
//   credentials: true,
//   origin: (origin, callback) => {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
app.use(cors({
  origin: "https://nvhshop.onrender.com",
  // headers: ["Content-Type"],
  credentials: true,
}));
// app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;
route(app)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://nvhshop.onrender.com"]
  }
}); 



global._io = io; 
const {UserSocketId} = require("./src/app/models/Notification");
const { log } = require('console');
io.on('connection', (socket) => {
  const socketID = socket.id;
  console.log('New connection. Socket ID:', socketID);
  socket.on("userId", async (userId) => {
    if(!userId) return
    const userSocketId = await UserSocketId.findOne({ userId });
    if (userSocketId) {
      userSocketId.socketId.push(socketID);
      await userSocketId.save();
    } else {
      const newUserSocketId = new UserSocketId({
        userId,
        socketId: [socketID],
      });
      await newUserSocketId.save();
    }
    console.log(`Received userId from client: ${userId}`);

  });
  socket.on("sendNotiToAdmin", (msg)=>{
    console.log({msg});
    _io.emit('sendNotiToAdmin',  msg)
  })
  socket.on('disconnect', () => {
    console.log(`Connection closed. Socket ID: ${socketID}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});