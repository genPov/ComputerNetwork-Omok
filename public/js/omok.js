const BALCK = 1
const WHITE = 2

// 매칭중
loading.start()

// 오목판 생성
var b = document.getElementsByClassName("board")[0];
var board = [];
for (var i = 0; i < 15; i++) {
	board[i] = [];
	for (var j = 0; j < 15; j++) {
		board[i][j] = 0;
		var cell = document.createElement("div");
		cell.className = "empty";
		cell.setAttribute("onclick", `setStone(this,${i},${j})`);
		b.appendChild(cell);
	}
}

var socket = io();
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