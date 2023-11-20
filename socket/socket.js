const { jwtdata } = require('../middlewares/auth');
const SocketIO = require("socket.io");
const Room = require("./room");
const game = require("./game");

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
    const waitingQueue = [];

    // 소켓 연결 시 호출
    io.on("connection", (socket) => {
        console.log('New connection from ' + getAddress(socket));
        socket.data = jwtdata(socket.handshake.headers.cookie.split('=')[1]);
        //console.log(typeof(socket.data));
        /* 방 리스트 */
        // data: null
        socket.on("roomList", (data) => {
            socket.emit("roomList", roomList);
        });


        /* 방 생성 */
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


        /* 방 참가 */
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


        /* 방 퇴장 */
        function exitRoom(roomId) {
            var room = roomList[roomId];

            if (room == null) {
                console.log(`[*] Error: roomList[${roomId}] == null`);
                return -1;
            }
            
            room.userCount -= 1;
            socket.leave(`${roomId}`);

            // 남은 인원이 없는 경우 방 삭제
            if (room.userCount == 0) {
                delete roomList[roomId];
                delete passwords[roomId];
                io.emit("roomDeleted", room);
                console.log(`room ${room.id} deleted`);
            }

            return 0;
        }
        // data: null
        socket.on("exitRoom", (data) => {
            var roomId = Array.from(socket.rooms)[1];

            if (roomId == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }
            if (exitRoom(roomId) == -1) {
                socket.emit("error", "오류가 발생했습니다.");
            }
            
            socket.emit("exitRoom");
        });


        /* 방 채팅 */
        socket.on("roomMessage", (msg) => {
            
            console.log(`${getAddress(socket)}: ${msg}`);

            var roomId = Array.from(socket.rooms)[1];
            
            if (roomId == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }
            if (typeof msg != "string") {
                socket.emit("error", "오류가 발생했습니다.");
                return;
            }

            io.to(`${roomId}`).emit("roomMessage", {id: socket.data.uid, msg: msg});
        });

        /* 자동 매칭 */
        socket.on("autoMatching", (data) => {
            waitingQueue.push(socket);
    
            if (waitingQueue.length >= 2) {
                const player1 = waitingQueue.shift();
                const player2 = waitingQueue.shift();
                        
                new Room("", false);
                game.game(player1, player2)
            }
            
              socket.on('disconnect', () => {
                console.log('A user disconnected');
                waitingQueue = waitingQueue.filter((user) => user.id !== socket.id);
            }); 
        });

        
        /* 방에 들어가 있는 도중 연결이 끊어진 경우 방 퇴장 */
        function disconnectCheck(roomId) {
            var rooms = Array.from(socket.rooms);
            if (rooms.length == 0 && roomId != null) {
                console.log(`${getAddress(socket)} disconnected`);
                exitRoom(roomId);
                return;
            }

            setTimeout(() => {disconnectCheck(rooms[1])}, 1000);
        }
        disconnectCheck(null);
    });
}