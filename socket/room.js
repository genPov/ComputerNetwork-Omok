var roomCount = 0;

class Room {
    constructor(name, isPrivate) {
        roomCount += 1;
        this.id = roomCount
        this.name = name;
        this.isPrivate = isPrivate;
        this.users = {};
        this.userCount = 0;
        this.p1 = null;
        this.p2 = null;
    };

    join(socket) {
        this.users[socket.data.uid] = socket.data;
        socket.join(`${this.id}`);
        socket.emit("joinRoom", this);
        this.userCount += 1;
    }

    leave(socket) {
        delete this.users[socket.data.uid];
        socket.leave(`${this.id}`);
        socket.emit("leaveRoom");
        this.userCount -= 1;
    }
}

module.exports = Room;