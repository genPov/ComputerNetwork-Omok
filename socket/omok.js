module.exports = class Omok {
    
    EMPTY = 0;
	BLACK = 1;
	WHITE = 2;

    constructor() {
        this.board = [];
        for (var i = 0; i < 15; i++) {
            this.board[i] = [];
            for (var j = 0; j < 15; j++) {
                this.board[i][j] = 0;
            }
        }

        this.current = {};
    }

    // 돌 놓기
    set(color, x, y) {
        
        // 돌 색 검사
        if (color != this.BLACK && color != this.WHITE) {
            return -1;
        }
        // 좌표 이탈 검사
        if (x < 0 || x >= 15 || y < 0 || y >= 15) {
            return -1;
        }
        // 놓을 수 있는 곳인지 검사
        if (this.board[y][x] != 0) {
            return -1;
        }

        this.board[y][x] = color;

        //this.setForbidden();

        return 0;
    }

    // 좌표에 두면 이기는지 검사
    isWin(color, x, y) {
        const count = (dx, dy) => {
            var cnt = 0;
            var xx = x;
            var yy = y;
            while (1) {
                xx += dx;
                yy += dy;
                if (this.board[yy][xx] != color) {
                    break;
                }
                cnt += 1;
            }
            return cnt;
        }

        if (color == this.BLACK && (
            count(-1, -1) + count(1, 1) == 4 ||
            count(-1, 0) + count(1, 0) == 4 ||
            count(0, -1) + count(0, 1) == 4 ||
            count(-1, 1) + count(1, -1) == 4
        )) {
            return true;
        }
        else if (color == this.WHITE && (
            count(-1, -1) + count(1, 1) >= 4 ||
            count(-1, 0) + count(1, 0) >= 4 ||
            count(0, -1) + count(0, 1) >= 4 ||
            count(-1, 1) + count(1, -1) >= 4
        )) {
            return true;
        }
        else {
            return false;
        }
    }
}