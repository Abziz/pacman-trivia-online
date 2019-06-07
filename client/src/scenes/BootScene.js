import Phaser from 'phaser';
import { SCENES, CONFIG } from '../constants';

export class BootScene extends Phaser.Scene {

	constructor() {
		super({ key: SCENES.BOOT });
	}

	preload() {
		this.loadingText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50, 'Loading...', { font: '20px monospace', fill: '#ffffff' });
		this.loadingText.setOrigin(0.5, 0.5);
		this.percentText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, '0%', { font: '18px monospace', fill: '#ffffff' });
		this.percentText.setOrigin(0.5, 0.5);
		this.load.on('progress', (value) => {
			this.percentText.setText(parseInt(value * 100) + '%');
		});

		//this.load.image('PADDLE_SPRITE', 'assets/paddle.png');
		//this.load.spritesheet('BALL_SPRITE', 'assets/ball.png', { frameWidth: 695, frameHeight: 673 });
		//this.load.html('REGISTER_FORM_HTML', '/assets/dom/register-form.html');
	}
	create() {
		this.scene.start(SCENES.GAME);
	}
}