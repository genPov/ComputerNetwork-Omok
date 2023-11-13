class Omok {
    
    constructor() {
        self.board = [];
        for (var i = 0; i < 15; i++) {
            self.board[i] = [];
            for (var j = 0; j < 15; j++) {
                self.board[i][j] = 0;
            }
        }

        self.current = {};
    }

    get BLACK() {
        return 1;
    }
    get WHITE() {
        return 2;
    }

    // 돌 놓기
    set(color, x, y) {
        
        // 돌 색 검사
        if (color != this.BLACK && color != this.WHITE) {
            return -1
        }
        // 좌표 이탈 검사
        if (x < 0 || x >= 15 || y < 0 || y >= 15) {
            return -1;
        }
        // 놓을 수 있는 곳인지 검사
        if (self.board[y][x] != 0) {

        }

        self.board[y][x] = color;

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
                if (self.board[y][x] != color) {
                    break;
                }
                cnt += 1;
            }
            return cnt;
        }

        if (
            count(-1, -1) + count(1, 1) == 4 ||
            count(-1, 0) + count(1, 0) == 4 ||
            count(0, -1) + count(0, 1) == 4 ||
            count(-1, 1) + count(1, -1) == 4
        ) {
            return 1;
        }
        else {
            return 0;
        }
    }
}