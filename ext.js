(function(ext) {
	function newSock() {
		if (ext._ws) ext._ws.close();
		ext._ws = new WebSocket('ws://localhost:3000');
		ext._ws.addEventListener('close', onClose);
		ext._ws.addEventListener('message', onData);
		ext._ws.addEventListener('open', onOpen);
		ext._ws.binaryType = 'arraybuffer';
	};
	function onClose(evt) {
		console.log('closed');
		try {
			if (ext._ws && evt.code != 1006) {
				newSock();
			} else {
				console.log('disconnected (1006)');
				ext._ws = null;
			}
		} catch (e) {
			console.log('disconnected');
			ext._ws = null;
		}
	};
	function onData(msg) {
		ext._status = new DataView(msg.data);
		console.log(ext.get_last_oplet() + ' errored: ' + ext.get_last_errored());
	};
	function onOpen() {
		console.log('connected');
		ext.get_robot_status();
	};
	newSock();
	ext._shutdown = function() {
		let s = ext._ws;
		ext._ws = null;
		s.close();
	};
	ext._getStatus = function() {
		if (!ext._ws) return {status: 0, msg: 'Disconnected'};
		if (ext._ws.readyState == 1) return {status: 2, msg: 'Connected'};
		if (ext._ws.readyState == 0) return {status: 1, msg: 'Connecting'};
		return {status: 0, msg: 'Not connected'};
	};
	ext._status = new DataView(new ArrayBuffer(60 * 4)); // 60 addresses, 32-bit int each
	ext._count = 0;
	ext.move_all_joints = function(j1, j2, j3, j4, j5) {
		console.log('a ' + j1 + " " + j2 + " " + j3 + " " + j4 + " " + j5);
		ext._ws.send("1 " + (ext._count++) + " 1 undefined a " + j1 * 3600 + " " + j2 * 3600 + " " + j3 * 3600 + " " + j4 * 3600 + " " + j5 * 3600 + " ;");
	};
	ext.move_to = function(x, y, z, jx, jy, jz, leftRight, upDown, inOut) {
		console.log('M ' + x + ' ' + y + ' ' + z + ' ' + jx + ' ' + jy + ' ' + jz + ' ' + leftRight + ' ' + upDown + ' ' + inOut);
		ext._ws.send(
			"1 " + (ext._count++) + " 1 undefined M "
			+ x * 1000000 + ' ' + y * 1000000 + ' ' + z * 1000000 + ' '
			+ parseInt(jx) + ' '
			+ parseInt(jy) + ' '
			+ parseInt(jz) + ' '
			+ (0 + (leftRight == 'right')) + ' '
			+ (0 + (upDown == 'up')) + ' '
			+ (0 + (inOut == 'out')) + ' '
			+ ';'
		);
	};
	ext.pid_move_all_joints = function(j1, j2, j3, j4, j5) {
		console.log('P', j1, j2, j3, j4, j5);
		ext._ws.send('1 ' + (ext._count++) + ' 1 undefined P ' + j1 * 3600 + " " + j2 * 3600 + " " + j3 * 3600 + " " + j4 * 3600 + " " + j5 * 3600 + " ;");
	};
	ext.get_robot_status = function() {
		console.log('g');
		ext._ws.send('1 ' + (ext._count++) + ' 1 undefined g ;');
	};
	ext.get_last = function(thing) {
		return ext._status.getInt32({
			'job number': 00,
			'instruction number': 01,
			'start time': 02,
			'end time': 03
		}[thing] * 4, true);
	};
	ext.get_last_oplet = function() {
		return String.fromCharCode(ext._status.getInt32(04 * 4, true));
	};
	ext.get_last_errored = function() {
		return ext._status.getInt32(05 * 4, true) > 0;
	};
	ext.get_joint = function(joint, item) {
		return ext._status.getInt32(({
			'position at': 10,
			'position delta': 11,
			'position PID delta': 12,
			'position force delta': 13,
			'sin': 14,
			'cos': 15,
			'measured angle': 16,
			'sent position': 17
		}[item] + {
			'base': 0,
			'pivot': 10,
			'end': 20,
			'angle': 30,
			'rot': 40
		}[joint]) * 4, true);
	};
	ext.get_joint_6 = function(item) {
		return ext._status.getInt32((item == 'angle' ? 18 : 28) * 4, true);
	};
	ext.get_joint_7 = function(item) {
		return ext._status.getInt32((item == 'position' ? 38 : 48) * 4, true);
	};
	ext.reload = function() {
		console.log('reload');
		try {
			newSock();
		} catch (e) {}
	};
	ext.empty_instruction_queue = function() {
		console.log('F');
		ext._ws.send('1 1 1 undefined F ;');
	};
	var descriptor = {
		blocks: [
			[' ', 'move all joints j1: %n j2: %n j3: %n j4: %n j5: %n', 'move_all_joints', 0, 0, 135, 45, 0],
			[' ', 'move to x: %n y: %n z: %n direction x: %m.dexDirDirs y: %m.dexDirDirs z: %m.dexDirDirs config: %m.dexLeftRight %m.dexUpDown %m.dexInOut', 'move_to', 0, 0.5, 0.075, '0', '0', '-1', 'right', 'up', 'out'],
			[' ', 'pid move all joints j1: %n j2: %n j3: %n j4: %n j5: %n', 'pid_move_all_joints', 0, 0, 0, 0, 0],
			[' ', 'get robot status', 'get_robot_status'],
			['r', 'last %m.dexLastThing', 'get_last', 'job number'],
			['r', 'last oplet', 'get_last_oplet'],
			['b', 'last instruction errored?', 'get_last_errored'],
			['r', '%m.dexJointNames %m.dexJointData', 'get_joint', 'base', 'sin'],
			['r', 'joint 6 %m.dexJoint6Data', 'get_joint_6', 'angle'],
			['r', 'joint 7 %m.dexJoint7Data', 'get_joint_7', 'position'],
			[' ', 'reload', 'reload'],
			[' ', 'empty instruction queue', 'empty_instruction_queue']
		],
		menus: {
			dexDirDirs: ['-1', '0', '1'],
			dexLeftRight: ['left', 'right'],
			dexUpDown: ['up', 'down'],
			dexInOut: ['in', 'out'],
			dexLastThing: [
				'job number',
				'instruction number',
				'start time',
				'end time'
			],
			dexJointData: [
				'position at',
				'position delta',
				'position PID delta',
				'position force delta',
				'sin',
				'cos',
				'measured angle',
				'sent position'
			],
			dexJointNames: ['base', 'pivot', 'end', 'angle', 'rot'],
			dexJoint6Data: ['angle', 'force'],
			dexJoint7Data: ['position', 'force']
		}
	};
	ScratchExtensions.register('Dexter', descriptor, ext);
})({});