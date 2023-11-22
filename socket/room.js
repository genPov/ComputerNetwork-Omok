var roomCount = 0;

const players = {};

class Room {
    constructor(name, isPrivate) {
        roomCount += 1;
        this.id = roomCount;
        this.name = name;
        this.isPrivate = isPrivate;
        this.users = {};
        this.userCount = 0;
        this.host = null;
        this.player = [];
    };

    join(io, socket) {
        this.users[socket.data.uid] = socket.data;
        this.userCount += 1;

        socket.room = this;
        socket.join(`${this.id}`);
        socket.emit("joinRoom", this);
        this.emit(io, "userJoined", socket.data);
    }

    leave(io, socket) {
        delete this.users[socket.data.uid];
        this.userCount -= 1;
        this.unsetPlayer(io, socket);

        socket.room = null;
        socket.leave(`${this.id}`);
        socket.emit("leaveRoom");
        this.emit(io, "userLeft", socket.data);
    }

    setPlayer(io, socket, n) {
        if (this.player[0] == socket.data || this.player[1] == socket.data || this.player[n] != null) {
            return -1;
        }
        this.player[n] = socket.data;
        this.emit(io, "setPlayer", {player: socket.data, n: n});

        if (players[this.id] == null) {
            players[this.id] = [];
        }
        players[this.id][n] = socket;
    }

    unsetPlayer(io, socket) {
        if (this.player[0] == socket.data) {
            this.player[0] = null;
            this.emit(io, "unsetPlayer", 0);
        }
        else if (this.player[1] == socket.data) {
            this.player[1] = null;
            this.emit(io, "unsetPlayer", 1);
        }
        else {
            return -1;
        }
        return 0;
    }

    emit(io, tag, data) {
        io.to(`${this.id}`).emit(tag, data);
    }
}

module.exports = Room;