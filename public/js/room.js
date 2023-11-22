export const room = (socket) => {

	// 게임 화면 div
	const roomWrapper = document.getElementsByClassName("room")[0];

	// 방 제목
	const title = document.querySelector(".room > .dashboard > .top-bar > .room-name");

	// 채팅창
	const chat = document.querySelector(".room > .dashboard > .chat > .message-wrapper");
	
	// 채팅 입력창
	const messageInput = document.querySelector(".room > .dashboard > .chat > .input-wrapper > input");
	const sendMessageButton = document.querySelector(".room > .dashboard > .chat > .input-wrapper > i");

	// 플레이어 1, 2
	const player = document.getElementsByClassName("player");


	function setPlayer(e, player, n) {
		e.textContent = player.uid;
		e.classList.add("joined");
	}
	function unsetPlayer(e, n) {
		e.textContent = `player${n+1}`;
		e.classList.remove("joined");
	}


	var room;

	/* 방 입장 */
	socket.on("joinRoom", (data) => {
		room = data;
		roomWrapper.style.display = "flex";

		// 이전 채팅 삭제
		chat.replaceChildren();

		// 방 제목
		title.textContent = room.name;

		// 플레이어
		if (room.player[0] != null) {
			setPlayer(player[0], room.player[0], 0);
		}
		if (room.player[1] != null) {
			setPlayer(player[1], room.player[1], 1);
		}
	});

	/* 방 퇴장 */
	document.getElementById("leaveRoom").onclick = () => {
		socket.emit("leaveRoom");
	};
	socket.on("leaveRoom", () => {
		roomWrapper.style.display = "none";
	});

	/* 유저 입장 */
	socket.on("userJoined", (user) => {
		room.users[user.uid] = user;
	});

	/* 유저 퇴장 */
	socket.on("userLeft", (user) => {
		delete room.users[user.uid];
	});

	/* 플레이어 입장 */
	document.getElementById("p1").onclick = () => {
		socket.emit("setPlayer", 0);
	};
	document.getElementById("p2").onclick = () => {
		socket.emit("setPlayer", 1);
	};
	socket.on("setPlayer", (data) => {
		room.player[data.n] = data.player;
		setPlayer(player[data.n], data.player, data.n);
	});

	/* 플레이어 퇴장 */
	socket.on("unsetPlayer", (n) => {
		room.player[n] = null;
		unsetPlayer(player[n], n);
	});



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

	var color;

	// 선후공
	socket.on("color", (data) => {
		loading.stop()
		color = data;
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