import {nanoid} from 'https://cdnjs.cloudflare.com/ajax/libs/nanoid/4.0.0/async/index.browser.min.js'

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth * 0.90;
canvas.height = window.innerHeight * 0.90;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");
let pencil = document.querySelector(".pencil");
let eraser = document.querySelector(".eraser");
let pencilToolCont = document.querySelector(".pencil-tool-cont");
let eraserToolCont = document.querySelector(".eraser-tool-cont");
let pencilFlag = false;
let eraserFlag = false;
let create = document.querySelector(".create");
let join = document.querySelector(".join");
let submit = document.querySelector(".submit");
var id='test';
create.addEventListener('click',(e)=>{
    nanoid().then((nid)=>{
        id=nid;
        socket.emit("create",id)
    }).then(()=>{
    var para = document.createElement('span')
    para.innerText=`Your Room id is: ${id}`
    document.querySelector('.rooms').appendChild(para)
    })
})

submit.addEventListener('click',(e)=>{
    socket.emit('join',join.value)
    id=join.value;
    var para = document.createElement('span')
    para.innerText=`Your Room id is: ${join.value}`
    document.querySelector('.rooms').appendChild(para)
})
pencil.addEventListener("click", (e) => {
    // true -> show pencil tool, false -> hide pencil tool
    pencilFlag = !pencilFlag;
    if (pencilFlag) pencilToolCont.style.display = "block";
    else pencilToolCont.style.display = "none";
})

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

// let undoRedoTracker = []; //Data
// let track = 0; // Represent which action from tracker array

let undostack=[''];
let redostack=[];

let mouseDown = false;
let touched =false;

// API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    let data = {
        id:id,
        x: e.clientX,
        y: e.clientY
    }
    // send data to server
    socket.emit("beginPath", data);
})
canvas.addEventListener("touchstart", (e) => {
    touched = true;
    let data = {
        id:id,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
    }
    // send data to server
    socket.emit("beginPath", data);
})
canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        let data = {
            id:id,
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawStroke", data);
    }
})
canvas.addEventListener("touchmove", (e) => {
    if (touched) {
        let data = {
            id:id,
            x:e.touches[0].clientX,
            y:e.touches[0].clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawStroke", data);
    }
})
canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;
    let url = canvas.toDataURL();
    // track = undoRedoTracker.length-1;
    undostack.push(url)
})

canvas.addEventListener("touchend", (e) => {
    touched = false;
    let url = canvas.toDataURL();
    undostack.push(url)
    // undoRedoTracker.push(url);
    // track = undoRedoTracker.length-1;
})

undo.addEventListener("click", (e) => {
    // if (undostack.length>0) track--;
    // // track action
    // console.log(track)
    if(undostack.length==0)return
    let data = {
        id:id,
        // trackValue: track,
        // undoRedoTracker
        op:'u',
        undostack,redostack
    }
    socket.emit("redoUndo", data);
})
redo.addEventListener("click", (e) => {
    // if (track < undoRedoTracker.length-1) track++;
    // track action
    if(redostack.length==0)return
    let data = {
        id:id,
        // trackValue: track,
        // undoRedoTracker
        op:'r',
        undostack,redostack
    }
    socket.emit("redoUndo", data);
})

function undoRedoCanvas(trackObj) {
    // track = trackObj.trackValue;
    // undoRedoTracker = trackObj.undoRedoTracker;
    // let url = undoRedoTracker[track];
    console.log("launched")
    const op=trackObj.op;
    undostack=trackObj.undostack;
    redostack=trackObj.redostack;
    var url;
    if(op=='u'){
        url = undostack.pop()
        redostack.push(url);
    }
    if(op=='r'){
        url = redostack.pop();
        undostack.push(url);
    }
    tool.clearRect(0, 0, canvas.width, canvas.height);
    let img = new Image(); // new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}
pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})
eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})
eraser.addEventListener("click", (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    } else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
    eraserFlag = !eraserFlag;
    if (eraserFlag) eraserToolCont.style.display = "flex";
    else eraserToolCont.style.display = "none";
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    // data -> data from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    drawStroke(data);
})
socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})