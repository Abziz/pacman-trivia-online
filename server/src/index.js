const express = require('express'); // express 
const app = express(); // instantiate an express application
const server = require('http').Server(app); // create a server from the express app
const io = require('socket.io')(server); // integrate socket.io with our server
const Bundler = require('parcel-bundler'); // parcel bundler
const bodyParser = require('body-parser'); // body-parser
const uuid = require('uuid');
const itemsApi = require('./api/items');
const { CLIENT_EVENTS, SERVER_EVENTS } = require('../../shared/src/socket-events');
const env = process.env.NODE_ENV; // figure out the environment
const port = process.env.PORT || 3000; // use environment PORT or 3000

/* create a bundler and configure it */
const bundler = new Bundler('client/src/index.html', {
	outDir: 'client/dist', // where to put our bundled files
	minify: false, // reduce the size of our bundled files
	watch: env === 'development', // watch file changes only if we're in development
	sourceMaps: env === 'development'
});
app.use(bodyParser.json()); // allows json in request body
app.use('/api', itemsApi); // add the apiRouter to the '/api' route
app.use('/assets', express.static('client/assets')); // serve assets folder since parcel doesn't
app.use('/', bundler.middleware()); // serve our bundled file 

/* run the server and listen to requests */
server.listen(port, () => {
	console.log(`app is running on http://localhost:${port}`);
});

const MAX_PLAYERS_IN_ROOM = 2;
const rooms = {};
function join(socketId) {
	for (const id in rooms) {
		const players = rooms[id];
		if (players.length < MAX_PLAYERS_IN_ROOM) {
			players.push(socketId);
			return id;
		}
	}
	const roomId = uuid();
	rooms[roomId] = [socketId];
	return roomId;
}
function leave(socketId) {
	for (const id in rooms) {
		const players = rooms[id];
		if (players.length === 1) {
			delete rooms[id];
			return null;
		}
		const playerIndex = players.indexOf(socketId);
		if (playerIndex > -1) {
			players.splice(playerIndex, 1);
			return id;
		}
	}
}
/* setup socket.io event handlers here */
io.on('connection', function (socket) {
	//client connected to our app setup event listeners

	socket.on(CLIENT_EVENTS.JOIN, () => {
		const roomId = join(socket.id);
		socket.join(roomId);
		io.to(roomId).emit(SERVER_EVENTS.ROOM_STATUS, roomId, rooms[roomId], MAX_PLAYERS_IN_ROOM);
	});
	socket.on(CLIENT_EVENTS.MOVE, (data) => {
		socket.broadcast.emit(SERVER_EVENTS.USER_MOVED, socket.id, data);
	});
	socket.on(CLIENT_EVENTS.UPDATE, (ghosts) => {
		socket.broadcast.emit(SERVER_EVENTS.UPDATE, { ghosts });
	});
	socket.on('disconnect', () => {
		const roomId = leave(socket.id);
		if (roomId) {
			io.to(roomId).emit(SERVER_EVENTS.ROOM_STATUS, roomId, rooms[roomId]);
			io.to(roomId).emit(SERVER_EVENTS.USER_LEFT, socket.id);
		}
	});
});
