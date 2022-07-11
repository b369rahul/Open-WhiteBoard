const express= require("express");
//import express from 'express'
const app = express();
const socket = require("socket.io");
// var socket
// import ('socket.io').then((res)=> {socket=res.Socket})
//const nanoid = require('nanoid')
// import {nanoid} from 'nanoid'
//const nanoid = require('nanoid')
const uniqid = require('uniqid')

app.use(express.static("public"));

let port = 5000;
let server = app.listen(port, () => {
    console.log("Listening to port: " + port);
})

let io = socket(server,{
    cors: {
        origin: ["http://localhost:3000"],  // ["https://example.com", "https://dev.example.com"] but localhost not supported this way
        // allowedHeaders: ["my-custom-header"],   
        // credentials: true
      }
});

io.on("connection", (socket) => {
    socket.on('create',(id)=>{
        // const id=uniqid();
        socket.join(id)
        console.log(id)
    })
    socket.on('join',id=>{
        socket.join(id)
        console.log(id)
    })
    console.log("Made socket connection with socket_id: ",socket.id);
    // Received data
    
    socket.on("beginPath", (data) => {
        // data -> data from frontend
        // Now transfer data to all connected computers
        io.in(data.id).emit("beginPath", data)
        //io.sockets.emit("beginPath", data);
    })
    socket.on("drawStroke", (data) => {
        // data -> data from frontend
        // Now transfer data to all connected computers
        io.in(data.id).emit("drawStroke", data)
        //io.sockets.emit("drawStroke", data);
    })
    socket.on("redoUndo", (data) => {
        io.in(data.id).emit("redoUndo", data)
        //io.sockets.emit("redoUndo", data);
    })
})