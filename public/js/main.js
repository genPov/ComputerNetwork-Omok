var socket = io();
const roomList = document.getElementsByClassName("roomList")[0];

socket.emit("roomList", 1)
socket.on("roomAdded", (room) => {
   addRoom(room);
});

socket.on("roomList", (rooms) => {
   for (room in rooms) {
      addRoom(room);
   }
});

socket.on("roomDeleted", (room) => {
   document.getElementsByClassName(`${room.id}`)[0].remove();
});
document.addEventListener("DOMContentLoaded", function() {
    var logoContainer = document.getElementById("logo-container");
    var content = document.getElementById("content");
    setTimeout(function() {
        logoContainer.classList.add("hidden");
        content.style.display = "block";
    }, 1200);
});
function openPopup() {
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function submit() {
    var name = document.getElementById("roomName").value;
    var rpw = document.getElementById("rpw").value;
    var isPrivate = document.getElementById("secret").checked;
    var room = {name,rpw,isPrivate};
    
    console.log(room);
    socket.emit('createRoom',room)
}
function logout() {
    location.href="/logout"
}

function addRoom(room) {
   var item = document.createElement("div");
   item.className = "list";
//    item.className += `${room.id}`;
   item.innerHTML = room.name;
   item.onclick = () => {}; // 클릭이벤트
   roomList.appendChild(item);
}

