var socket = io();

socket.on("auth", (data) => {
    socket.data = data;
})

import { room } from "./room.js";

room(socket);

// 에러 로그
socket.on("error", (e) => {
    console.error(e);
});

// 방 목록 div
const roomList = document.getElementsByClassName("roomList")[0];

// div에 room 추가 함수
function addRoom(room) {
    var item = document.createElement("div");
    item.classList.add("list");
    item.classList.add(`${room.id}`);
    item.innerHTML = room.name;
    item.onclick = () => {
        socket.emit("joinRoom", {roomId: room.id, password: ""});
    };
    roomList.appendChild(item);
}

// 방 목록 초기화
socket.emit("roomList", 1)
socket.on("roomList", (rooms) => {
    for (var room of Object.values(rooms)) {
        addRoom(room);
    }
});

// 추가된 방 div에 적용
socket.on("roomAdded", (room) => {
    addRoom(room);
});
// 삭제된 방 div에 적용
socket.on("roomDeleted", (room) => {
    document.getElementsByClassName(`${room.id}`)[0].remove();
});

document.addEventListener("DOMContentLoaded", function() {
    var logoContainer = document.getElementById("logo-container");
    var content = document.getElementById("content");
    setTimeout(function() {
        logoContainer.classList.add("hidden");
        //content.style.display = "block";
    }, 1200);
});

// onclick 설정 함수
const setOnclickListner = (id, callback) => {
    document.getElementById(id).onclick = callback;
}

setOnclickListner("openPopup", () => {
    document.getElementById("popup").style.display = "block";
});

setOnclickListner("closePopup", () => {
    document.getElementById("popup").style.display = "none";
});

setOnclickListner("openPopup2", () => {
    document.getElementById("popup2").style.display = "block";
});

setOnclickListner("closePopup2", () => {
    document.getElementById("popup2").style.display = "none";
    socket.emit("disconnect");
});


setOnclickListner("createRoom", () => {
    var name = document.getElementById("roomName").value;
    var rpw = document.getElementById("rpw").value;
    var isPrivate = document.getElementById("secret").checked;
    var room = {name,rpw,isPrivate};
    
    socket.emit("createRoom", room);
    
    document.getElementById("popup").style.display = "none";
});


setOnclickListner("autoMatching", () => {
    socket.emit("autoMatching", true);
});


setOnclickListner("logout", () => {
    location.href="/logout"
});
