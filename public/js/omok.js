export const omok = (socket) => {

	const BALCK = 1
	const WHITE = 2

	// 오목판 생성
	const b = document.querySelector(".room > .game > .omok-board");
	const board = [];
	const cells = [];
	for (var i = 0; i < 15; i++) {
		board[i] = [];
		cells[i] = [];
		for (var j = 0; j < 15; j++) {
			var cell = document.createElement("div");
			cell.className = "empty";
			cell.onclick = () => { setStone(this, i ,j) };
			b.appendChild(cell);
			board[i][j] = 0;
			cells[i][j] = cell;
		}
	}

	var order;

	// 선후공
	socket.on("order", (data) => {
		loading.stop()
		order = data;
	});

	// 오목 진행
	socket.on("pos", (data) => {
		var x = data.x;
		var y = data.y;
		console.log(`pos=(${x}, ${y})`);
	});

	// 메세지 수신
	socket.on("msg", (msg) => {
		console.log(`msg=${msg}`);
	});


	// 돌 놓기 (board 클릭 이벤트)
	function setStone(cell, y, x) {
		socket.emit("pos", {"x":x,"y":y});
	}

	// 채팅 전송
	function sendMessage(cell, msg) {
		socket.emit("msg", msg);
	}
}