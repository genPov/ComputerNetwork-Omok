var roomCount = 0;

class Room {
    constructor(name, isPrivate) {
        roomCount += 1;
        this.id = roomCount
        this.name = name;
        this.isPrivate = isPrivate;
        this.userCount = 1;
    };
}

module.exports = Room;