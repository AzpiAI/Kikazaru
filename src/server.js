const static = require("node-static");
const file = new static.Server(`${__dirname}/views/server.html`);
const { WebSocket } = require("ws");
const { EventEmitter } = require("events");

const emitter = new EventEmitter();

var status = "idle";

const host = "127.0.0.1";
var port = 9900;

const server = require("http").createServer(function (request, response) {
	request
		.addListener("end", function () {
			file.serve(request, response);
		})
		.resume();
});

const wss = new WebSocket.Server({ server });

function onStatusChange(callback) {
	emitter.on("statusChange", callback);
}

function changeStatus(nextStatus) {
	emitter.emit("modelStatusChange", { prev: status, current: nextStatus });
	status = nextStatus;
}

function emitHostDir() {
	emitter.emit("host", `http://${host}:${port}`);
}

function start() {
	server.on("error", (e) => {
		if (e.code === "EADDRINUSE") {
			changeStatus("running_error");
			console.error(`Port ${port} is already in use`);

			console.log("Address in use, trying with next port");
			port++;
			setTimeout(() => {
				server.close();
				start();
			}, 1000);
		}
	});

	server.listen(port, () => {
		console.log(`Server started on port ${port}`);
		changeStatus("running");
		wss.on("connection", (ws) => {
			ws.on("message", (message) => {
				wss.clients.forEach(function (client) {
					client.send(message.toString());
				});
			});
		});
		emitHostDir();
	});
}

function stop() {
	if (server.listening) {
		server.close();
		changeStatus("idle");
	}
}

function onHost(callback) {
	emitter.on("host", callback);
}

function sendMessage(message) {
	wss.clients.forEach(function (client) {
		client.send(message.toString());
	});
}

function sendConfig(config) {
	sendMessage(JSON.stringify({ type: "config", data: config }));
}

function sendPartialResult(partialResult) {
	sendMessage(JSON.stringify({ type: "partial", data: partialResult }));
}

function sendResult(result) {
	sendMessage(JSON.stringify({ type: "result", data: result }));
}

module.exports = {
	start: start,
	stop: stop,
	sendConfig: sendConfig,
	sendPartialResult: sendPartialResult,
	sendResult: sendResult,

	onStatusChange: onStatusChange,
	onHost: onHost,
};
