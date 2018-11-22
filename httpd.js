var net = require('net'); //network
const ws = require('ws'); //websocket

//socket server to accept websockets from the browser on port 3000
//and forward them out to DexRun as a raw socket
var browser = new ws.Server({ port:3000 });
var dexter = null; // open a new socket every time ._.

browser.on('connection', function connection(socket, req) {
	console.log(process.hrtime()[1], " browser connected ", req.connection.Server);
	socket.on('message', function (data) {
		console.log(process.hrtime()[1], " browser says ", data.toString());
		//Now as a client, open a raw socket to DexRun on localhost
		if (!dexter) { 
			dexter = new net.Socket();
			dexter.connect(50000, process.argv[2] || "192.168.1.240");
			console.log(process.hrtime()[1], " dexter connecting");
			dexter.on("connect", function () {
				console.log(process.hrtime()[1], " dexter connected");
			});
			dexter.on("data", function (data){
				console.log(process.hrtime()[1], " dexter says: ", data);
				if (socket) {
					socket.send(data, { binary: true });
					console.log(process.hrtime()[1], " fw'd to browser ");
				}
			});
			dexter.on("close", function () {
				if (dexter) dexter.removeAllListeners();
				//or multiple connect/data/close events next time
				console.log(process.hrtime()[1], " dexter disconnect");
				if (socket) socket.close();
			});
		}
        	try {
			dexter.write(data.toString());
		} catch (e) {}
	});
	socket.on('close', function (data) {
		console.log(process.hrtime()[1], " browser disconnected");
		dexter.end();
		dexter.removeAllListeners();
		dexter = null;
	});
});