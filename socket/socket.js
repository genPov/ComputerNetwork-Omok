const SocketIO = require("socket.io");
const Room = require("./room");

module.exports = (server) => {
    console.log("socket start");

    const io = SocketIO(server, { path: "/socket.io" });
    const getAddress = (socket) => {
        var address = socket.handshake.address;
        return address;
        //return address.address + ':' + address.port;
    }

    const roomList = [];
    const passwords = [];


    // 소켓 연결 시 호출
    io.on("connection", (socket) => {
        console.log('New connection from ' + getAddress(socket));

        // setInterval(()=>{
        //     console.log(socket.rooms);
        // }, 1000);

        // 방 리스트
        // data: null
        socket.on("roomList", (data) => {
            socket.emit("roomList", roomList);
        });


        // 방 생성
        // data: {name: string, isPrivate: boolean, password: string}
        socket.on("createRoom", (data) => {
            var name = data.name.trim();
            console.log(`${getAddress(socket)} created room ${name}.`);
        
            // 이미 방에 참가중인 경우
            if (socket.rooms.size > 1) {
                console.log(`${getAddress(socket)} is already in room.`);
                socket.emit("error", "이미 다른 방에 참가중입니다.");
                return;
            }
        
            var room = new Room(name, data.isPrivate);
            roomList[room.id] = room;
            if (room.isPrivate) {
                passwords[room.id] = data.password;
            }

            socket.join(`${room.id}`);
            socket.emit("joinRoom", true);
            io.emit("roomAdded", room);
        });

        // 방 참가
        // data: {roomId: int, password: string}
        socket.on("joinRoom", (data) => {
            var roomId = data.roomId;
            var room = roomList[roomId];

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

            socket.join(`${roomId}`);
            room.userCount += 1;
            socket.emit("joinRoom", true);
        });

        // 방 퇴장
        // data: null
        socket.on("exitRoom", (data) => {
            var roomId = Array.from(socket.rooms)[1];
            var room = roomList[roomId];

            if (roomId == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }
            if (room == null) {
                socket.emit("error", "오류가 발생했습니다.");
                console.log(`[*] Error: roomList[${roomId}] == null`);
                return;
            }
            
            room.userCount -= 1;
            socket.leave(`${roomId}`);
            socket.emit("exitRoom");

            // 남은 인원이 없는 경우 방 삭제
            if (room.userCount == 0) {
                delete roomList[roomId];
                delete passwords[roomId];
                io.emit("roomDeleted", room);
                console.log(`room ${room.id} deleted`);
            }
        });
    });
}