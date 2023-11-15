export const room = (socket) => {

	const EMPTY = 0;
	const BLACK = 1;
	const WHITE = 2;

	// 오목판 생성
	const board = document.querySelector(".room > .game > .omok-board");
	const state = [];
	const cells = [];
	for (var i = 0; i < 15; i++) {
		state[i] = [];
		cells[i] = [];
		for (var j = 0; j < 15; j++) {
			var cell = document.createElement("div");
			cell.className = "empty";
			cell.onclick = () => { move(j, i) };

			board.appendChild(cell);
			state[i][j] = EMPTY;
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
	socket.on("move", (data) => {
		var x = data.x;
		var y = data.y;
		console.log(`move=(${x}, ${y})`);
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
	});


	/* 메세지 송신 */
	const messageInput = document.querySelector(".room > .dashboard > .chat > .input-wrapper > input");
	const sendMessageButton = document.querySelector(".room > .dashboard > .chat > .input-wrapper > i");
	
	// input 엔터 이벤트
	messageInput.addEventListener("keyup", (event) => {
		if (event.keyCode === 13) {
			sendMessageButton.click();
		}
	});
	sendMessageButton.onclick = () => {
		socket.emit("roomMessage", messageInput.value);
		messageInput.value = "";
	}


	/* 메세지 수신 */
	// data: {id: string, msg: string}
	const chat = document.querySelector(".room > .dashboard > .chat > .message-wrapper");
	
	socket.on("roomMessage", (data) => {
		var id = data.id;
		var msg = data.msg;

		var msgdiv = document.createElement("div");
		msgdiv.innerHTML = `${id}: ${msg}`;
		chat.appendChild(msgdiv);

		// 스크롤 맨 아래로
		chat.scrollTo(0, chat.scrollHeight);
	});
}