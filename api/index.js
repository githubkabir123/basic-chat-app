const cors = require("cors");
const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);

const {Server} = require("socket.io");

const io = new Server(server,{
    cors : {
        origin : "http://localhost:5173",
        methods: ["GET", "POST", "DELET"],
    }
});
const userSocketMap = new Map();
let activeUserList = [];
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    
    userSocketMap.set(userId, socket.id);

    socket.on("creatRoom",(joinRoomName)=>{
        socket.emit("new_group_connected", {joinRoomName ,groupId: socket.id})
    })
    // socket.on("creatRoom",(joinRoomName)=>{
    //     console.log(joinRoomName)
    //     socket.join(joinRoomName);
    //     socket.emit("new_group_connected", {joinRoomName ,groupId: socket.id})
    // })

    socket.on("send_group_massage",(data)=>{
        io.to(data.tergetGroup).emit("server_group_massage", {data})
    })

    socket.on("user_connected", (userData)=>{
        userData.userId = userId;
        activeUserList[activeUserList.length] = { userId,socketId: socket.id,userName: userData.userName};
        io.emit("new_user_connected", activeUserList);
    });
    socket.on("send_massage",(data)=>{
        if(data.user){
            const socketId = userSocketMap.get(data.user);
            io.to(socketId).emit("server_massage",data);
        }else{
            io.emit("server_massage",data);
        }

    })
    socket.on("disconnect",async ()=>{

        activeUserList =  await activeUserList.filter(data=>{
            if(data.socketId != socket.id) return data;
        })
        io.emit("user_offLine",activeUserList)
    })
})

app.use(cors());
app.use(express.static(path.join(__dirname,"/public")))

server.listen(3001,()=>{
    console.log("Server Has Started on posrt 3001")
})
