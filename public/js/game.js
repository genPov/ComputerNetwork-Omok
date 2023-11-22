export const game = (socket, room) => {

    const EMPTY = 0;
	const BLACK = 1;
	const WHITE = 2;

	const board = document.querySelector(".room > .game > .omok-board");
	const state = [];
	const cells = [];

	var color;

    var time = 30;
    var interval = null;
    const timerBar = document.querySelector(".room > .dashboard > .timer-bar");
    function timer() {
        if (interval != null) {
            clearInterval(interval);
        }
        time = 30;
        interval = setInterval(() => {
            if (time > 0) {
                time -= 1;
                timerBar.textContent = `${time}`;
            }
        }, 1000);
    }



	// 선후공
	socket.on("order", (data) => {
		color = data;

        // 오목판 생성
        board.replaceChildren();
        for (var i = 0; i < 15; i++) {
            state[i] = [];
            cells[i] = [];
            for (var j = 0; j < 15; j++) {
                var cell = document.createElement("div");
                cell.className = "empty";
                cell.onclick = (function (x, y) {
                    return function () {
                        move(x, y);
                    };
                })(j, i);

                board.appendChild(cell);
                state[i][j] = EMPTY;
                cells[i][j] = cell;
            }
        }

        // 타이머
        timerBar.style.display = "flex";
        timer();
	});

	/* 착수 */
	function move(x, y) {
		socket.emit("move", {"x":x,"y":y});
	}
	// 착수 적용
	// data: {color: int, x: int, y: int}
	socket.on("move", (data) => {
		var x = data.x;
		var y = data.y;
		var color = data.color;
		
		state[y][x] = color;
	    cells[y][x].className = (color == BLACK) ? "stone-black" : "stone-white";

        timer();
	});


    /* 게임 종료 */
    const players = document.getElementsByClassName("player");

    socket.on("gameEnd", (winner) => {
        timerBar.style.display = "none";
        clearInterval(interval);

        if (room.player[0].uid == winner.uid) {
            players[0].innerHTML = `${room.player[0].uid}<i class="fa-solid fa-crown" style="color: #ffff00;"></i>`
        }
        else {
            players[1].innerHTML = `${room.player[1].uid}<i class="fa-solid fa-crown" style="color: #ffff00;"></i>`
        }
    });
}