const { jwtdata } = require('../middlewares/auth');
const SocketIO = require("socket.io");
const Room = require("./room");
const game = require("./game");


module.exports = (server) => {
    console.log("socket start");
    
    const io = SocketIO(server, { path: "/socket.io" });
    var waitingQueue = [];
    const rooms = {};
    const passwords = {};


    // 소켓 연결 시 호출
    io.on("connection", (socket) => {
        console.log('New connection from ' + socket.handshake.address);
        
        // 디버깅
        socket.prependAny((eventName, ...args) => {
            console.log(`${socket.data}`);
            console.log(eventName, args);
        });

        socket.data = jwtdata(socket.handshake.headers.cookie.split('=')[1]);
        if (socket.data == null) {
            socket.emit("error", "연결 실패");
            return;
        }

        socket.emit("auth", socket.data);
        console.log(`${socket.data.uid} connected`);
        
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

            room.host = socket.data;
            room.join(io, socket);
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

            room.join(io, socket);
        });


        /* 방 퇴장 */
        function leaveRoom(room) {
            room.leave(io, socket);

            if (room.userCount == 0) {
                delete rooms[room.id];
                delete passwords[room.id];
                io.emit("roomDeleted", room);
            }
        }
        socket.on("leaveRoom", () => {
            if (socket.room == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }

            leaveRoom(socket.room);
        });

        /* 방장 변경 */
        socket.on("changeHost", (user) => {
            if (typeof n != "number" || n != 0 && n != 1) {
                socket.emit("error", "타입 오류");
            }
            socket.room.setPlayer(io, socket, n);
        });
        
        /* 플레이어 입장 */
        // n: number
        socket.on("setPlayer", (n) => {
            if (typeof n != "number" || n != 0 && n != 1) {
                socket.emit("error", "타입 오류");
            }
            socket.room.setPlayer(io, socket, n);
        });

        /* 플레이어 퇴장 */
        socket.on("unsetPlayer", () => {
            socket.room.unsetPlayer(io, socket);
        });

        /* 방 채팅 */
        socket.on("roomMessage", (msg) => {
            if (typeof msg != "string") {
                socket.emit("error", "타입 오류");
                return;
            }
            if (socket.room == null) {
                socket.emit("error", "참여중인 방이 없습니다.");
                return;
            }

            socket.room.emit(io, "roomMessage", {id: socket.data.uid, msg: msg});
        });

        /* 게임 시작 */
        socket.on("startGame", () => {
            if (socket.room.host != socket.data) {
                socket.emit("error", "권한이 없습니다.");
                return;
            }
            players = socket.room.getPlayers();
            if (players == null || players.length != 2) {
                socket.emit("error", "유저 2명 모두 준비해야 합니다.");
                return;
            }

            game(io, socket.room, players[0], players[1]);
        });

        /* 자동 매칭 */
        socket.on("autoMatching", () => {
            waitingQueue.push(socket);
            
            if (waitingQueue.length >= 2) {
                var player1 = waitingQueue.shift();
                var player2 = waitingQueue.shift();
                
                var room = new Room("", false);
                room.join(io, player1);
                room.join(io, player2);
                room.setPlayer(io, player1, 0);
                room.setPlayer(io, player2, 1);

                room.emit(io, "autoMatching");
                game(io, room, player1, player2);
            }
        });
        socket.on("cancelAutoMatching", () => {
            waitingQueue = waitingQueue.filter((user) => user.data.uid !== socket.data.uid);
        });


        /* 연결 끊김 처리 */
        function disconnectCheck(roomId) {
            var socketRoom = Array.from(socket.rooms);
            
            if (socketRoom.length == 0 && roomId != null) {
                console.log(`${socket.data.uid} disconnected`);
                leaveRoom(socket.room);
                waitingQueue = waitingQueue.filter((user) => user.data.uid !== socket.data.uid);
                return;
            }

            setTimeout(() => {disconnectCheck(socketRoom[1])}, 1000);
        }
        disconnectCheck(null);
    });
}