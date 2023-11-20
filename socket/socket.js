const { jwtdata } = require('../middlewares/auth');
const SocketIO = require("socket.io");
const Room = require("./room");

module.exports = (server) => {
    console.log("socket start");

    const getAddress = (socket) => {
        var address = ㅁ;
        return address;
        //return address.address + ':' + address.port;
    }
    
    const io = SocketIO(server, { path: "/socket.io" });

    const rooms = {};
    const passwords = {};


    // 소켓 연결 시 호출
    io.on("connection", (socket) => {
        console.log('New connection from ' + socket.handshake.address);
        
        socket.data = jwtdata(socket.handshake.headers.cookie.split('=')[1]);
        if (socket.data == null) {
            socket.emit("error", "연결 실패");
            return;
        }
        
        /* 방 리스트 */
        // data: null
        socket.on("roomList", (data) => {
            socket.emit("roomList", rooms);
        });


        /* 방 생성 */
        // data: {name: string, isPrivate: boolean, password: string}
        socket.on("createRoom", (data) => {
            if (
                typeof data.name !== "string" ||
                typeof data.isPrivate !== "boolean" ||
                (data.isPrivate === true && typeof data.password !== "string")
            ) {
                socket.emit("error", "타입 오류");
                return;
            }
            if (data.name.trim() == "") {
                socket.emit("error", "방 이름을 입력해주세요.");
                return;
            }
            // 이미 방에 참가중인 경우
            if (socket.rooms.size > 1) {
                console.log(`${socket.data.uid} is already in room.`);
                socket.emit("error", "이미 다른 방에 참가중입니다.");
                return;
            }
        
            console.log(`${socket.data.uid} created room ${data.name}.`);

            var room = new Room(data.name, data.isPrivate);
            rooms[room.id] = room;
            if (data.isPrivate) {
                passwords[room.id] = data.password;
            }

            room.join(socket);
            io.emit("roomAdded", room);
        });


        /* 방 참가 */
        // data: {roomId: number, password: string}
        socket.on("joinRoom", (data) => {
            if (typeof data.roomId !== "number") {
                socket.emit("error", "타입 오류");
                return;
            }
            var room = rooms[data.roomId];

            if (socket.rooms.size > 1) {
                socket.emit("error", "이미 다른 방에 참가중입니다.");
                return;
            }
            if (room == null) {
                socket.emit("error", "존재하지 않는 방입니다.");
                return;
            }
            if (room.isPrivate && room.password != data.password) {
                socket.emit("error", "비밀번호가 틀렸습니다.");
                return;
            }

            room.join(socket);
            io.to(`${room.id}`).emit("userJoined", socket.data);
        });


        /* 방 퇴장 */
        // data: null
        function leaveRoom(room) {
            room.leave(socket);

            if (room.userCount == 0) {
                delete rooms[room.id];
                delete passwords[room.id];
                io.emit("roomDeleted", room);
            }
            else {
                io.to(`${room.id}`).emit("userLeft", socket.data);
            }
        }
        socket.on("leaveRoom", (data) => {
            var roomId = Array.from(socket.rooms)[1];

            if (roomId == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }
            
            var room = rooms[roomId];

            if (room == null) {
                console.log(`[*] Error: roomList[${roomId}] == null`);
                socket.emit("error", "오류가 발생했습니다.");
            }

            leaveRoom(room);
        });


        /* 방 채팅 */
        socket.on("roomMessage", (msg) => {
            if (typeof msg != "string") {
                socket.emit("error", "타입 오류");
                return;
            }

            var roomId = Array.from(socket.rooms)[1];
            
            if (roomId == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }

            io.to(`${roomId}`).emit("roomMessage", {id: socket.data.uid, msg: msg});
        });





        
        /* 방에 들어가 있는 도중 연결이 끊어진 경우 방 퇴장 */
        function disconnectCheck(roomId) {
            var socketRoom = Array.from(socket.rooms);
            if (socketRoom.length == 0 && roomId != null) {
                console.log(`${socket.data.uid} disconnected`);
                leaveRoom(rooms[roomId]);
                return;
            }

            setTimeout(() => {disconnectCheck(socketRoom[1])}, 1000);
        }
        disconnectCheck(null);
    });
}