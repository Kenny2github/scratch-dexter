(function(ext) {
	ext._ws = new WebSocket('ws://localhost:3000');
	ext._ws.onclose = function() {
		if (ext._ws) ext._ws = new WebSocket('ws://localhost:3000');
	};
	ext._shutdown = function() {
		let s = ext._ws;
		ext._ws = null;
		s.close();
	};
	ext._getStatus = function() {
		if (ext._ws.readyState == 1) return {status: 2, msg: 'Connected'};
		if (ext._ws.readyState == 0) return {status: 1, msg: 'Connecting'};
		return {status: 0, msg: 'Not connected'};
	};
	ext._count = 0;
	ext.move_all_joints = function(j1, j2, j3, j4, j5) {
		console.log(j1 + " " + j2 + " " + j3 + " " + j4 + " " + j5);
		ext._ws.send("1 " + (ext._count++) + " 1 undefined a " + j1 + " " + j2 + " " + j3 + " " + j4 + " " + j5 + ";");
	};
	var descriptor = {
		blocks: [
			[' ', 'move all joints j1: %n j2: %n j3: %n j4: %n j5: %n', 'move_all_joints', 0, 0, 135 * 3600, 45 * 3600, 0]
		]
	};
	ScratchExtensions.register('Dexter', descriptor, ext);
})({});