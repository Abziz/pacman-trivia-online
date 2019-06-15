import Phaser from 'phaser';
import { CONFIG } from './constants';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { MultiPlayerScene } from './scenes/MultiPlayerScene';
import { WaitingForPlayersScene } from './scenes/WaitingForPlayersScene';

new Phaser.Game({
	type: Phaser.CANVAS,
	width: CONFIG.WIDTH,
	height: CONFIG.HEIGHT,
	parent: 'body',
	backgroundColor: '#bbb',
	scene: [BootScene, GameScene, MultiPlayerScene, WaitingForPlayersScene],
	dom: { createContainer: true },
	fps: {
		target: CONFIG.FPS

	},
	physics: {
		default: 'arcade',
		arcade: {
			fps: CONFIG.FPS
		},
	}
});
