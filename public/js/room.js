import { game } from "./game.js";

export const room = (socket) => {

	// 게임 화면 div
	const roomWrapper = document.getElementsByClassName("room")[0];

	// 방 제목
	const title = document.querySelector(".room > .dashboard > .top-bar > .room-name");

	// 플레이어 1, 2
	const player = document.getElementsByClassName("player");

	// 시작 버튼
	const startButton = document.querySelector(".room > .dashboard > .start-button");

	// 채팅창
	const chat = document.querySelector(".room > .dashboard > .chat > .message-wrapper");
	
	// 채팅 입력창
	const messageInput = document.querySelector(".room > .dashboard > .chat > .input-wrapper > input");
	const sendMessageButton = document.querySelector(".room > .dashboard > .chat > .input-wrapper > i");


	function setPlayer(e, player) {
		e.textContent = player.uid;
		e.classList.add("joined");
	}
	function unsetPlayer(e, n) {
		e.textContent = `player${n+1}`;
		e.classList.remove("joined");
	}

	function addMessage(msg, color = "white") {
		var msgdiv = document.createElement("div");
		msgdiv.textContent = msg;
		msgdiv.style.color = color;
		chat.appendChild(msgdiv);

		// 스크롤 맨 아래로
		chat.scrollTo(0, chat.scrollHeight);
	}


	var room;

	/* 방 입장 */
	socket.on("joinRoom", (data) => {
		room = data;
		roomWrapper.style.display = "flex";

		// 방 제목
		title.textContent = room.name;

		// 방장이면 시작 버튼 보이기
		console.log(room);
		if (socket.data.uid == room.host.uid) {
			startButton.style.display = "flex";
		}

		// 플레이어
		if (room.player[0] != null) {
			setPlayer(player[0], room.player[0], 0);
		}
		if (room.player[1] != null) {
			setPlayer(player[1], room.player[1], 1);
		}

		// 이전 채팅 삭제
		chat.replaceChildren();
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
		addMessage(`${user.uid}님이 입장하셨습니다.`, "yellow");
	});

	/* 유저 퇴장 */
	socket.on("userLeft", (user) => {
		delete room.users[user.uid];
		addMessage(`${user.uid}님이 퇴장하셨습니다.`, "yellow");
	});

	/* 방장 변경 */
	socket.on("changeHost", (user) => {
		room.host = user;

		// 방장 설정
		if (socket.data.uid == room.host.uid) {
			startButton.style.display = "flex";
		}
		else {
			startButton.style.display = "none";
		}
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

	/* 게임 시작 */
	startButton.onclick = () => {
		socket.emit("startGame");
	}
	socket.on("startGame", () => {
		game(socket, room);
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

		addMessage(`${id}: ${msg}`);
	});

}