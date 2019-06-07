import Phaser from 'phaser';
import { CONFIG } from './constants';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { socket } from './socket';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../../shared/src/socket-events';

socket.on('connect', () => {
	socket.emit(CLIENT_EVENTS.GREET, { message: 'Valar morghulis', name: 'John' });
});
socket.on(SERVER_EVENTS.GREET_BACK, ({ message }) => {
	console.warn(message);
});

new Phaser.Game({
	type: Phaser.CANVAS,
	width: CONFIG.WIDTH,
	height: CONFIG.HEIGHT,
	parent: 'body',
	backgroundColor: '#bbb',
	scene: [BootScene, GameScene],
	dom: { createContainer: true },
	physics: {
		arcade: {
			debug: true,
		}
	}
});
