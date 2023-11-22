const Omok = require("./omok");

// room, 플레이어1, 플레이어2
module.exports = (io, room, p1, p2) => {

    room.emit(io, "startGame");

    const EMPTY = 0;
	const BLACK = 1;
	const WHITE = 2;

    const omok = new Omok();

    // 선후공
    if (Math.floor(Math.random())) {
        p1.emit("order", BLACK);
        p2.emit("order", WHITE);
        var black = p1;
        var white = p2;
    } else {
        p2.emit("order", BLACK);
        p1.emit("order", WHITE);
        var black = p2;
        var white = p1;
    }

    var order = BLACK;
    var limit = 30 * 1000;
    var time = new Date();

    function win(color) {
        var winner;

        if (color == BLACK) {
            winner = (p1.data.uid == black.data.uid) ? p1.data : p2.data;
        }
        else if (color == WHITE) {
            winner = (p1.data.uid == white.data.uid) ? p1.data : p2.data;
        }

        black.removeAllListeners("move");
        white.removeAllListeners("move");
        room.emit(io, "gameEnd", winner);
    }

    var timeCheck = setInterval(() => {
        if (new Date() - time > limit) {
            win(order == BLACK ? WHITE : BLACK);
            clearInterval(timeCheck);
        }
    }, 200);

    black.on("move", (pos) => {
        if (order != BLACK || omok.set(BLACK, pos.x, pos.y) == -1) {
            black.emit("error", "오류가 발생했습니다.");
            return;
        }
        
        time = new Date();
        room.emit(io, "move", {x: pos.x, y: pos.y, color: BLACK});
        order = WHITE;

        if (omok.isWin(BLACK, pos.x, pos.y)) {
            win(BLACK);
        }
    });

    white.on("move", (pos) => {
        if (order != WHITE || omok.set(WHITE, pos.x, pos.y) == -1) {
            white.emit("error", "오류가 발생했습니다.");
            return;
        }
        
        time = new Date();
        room.emit(io, "move", {x: pos.x, y: pos.y, color: WHITE});
        order = BLACK;

        if (omok.isWin(WHITE, pos.x, pos.y)) {
            win(WHITE);
        }
    });
}