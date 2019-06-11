import Phaser from 'phaser';
import { SCENES, TILEMAPS, CONFIG, TILESETS } from '../constants';
import { Pacman } from '../game-objects/Pacman';
import { Ghost } from '../game-objects/Ghost';

export class GameScene extends Phaser.Scene {

	constructor() {
		super({ key: SCENES.GAME });
	}
	init() {
	}
	preload() {

	}
	create() {
		this.level = this.add.tilemap(TILEMAPS.LEVEL, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.WIDTH_TILES, CONFIG.HEIGHT_TILES);
		this.levelTileset = this.level.addTilesetImage('pokemon_32x32', TILESETS.POKEMON);
		this.backgroundLayer = this.level.createStaticLayer('background', this.levelTileset);
		this.wallsLayer = this.level.createStaticLayer('walls', this.levelTileset);
		this.wallsLayer.setCollisionByProperty({ wall: true });

		this.player = new Pacman(this, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' }));
		this.player2 = new Pacman(this, this.input.keyboard.addKeys({ up: 'W', down: 'S', right: 'D', left: 'A' }));
		this.player2.setTint(0xff0000);
		this.ghost = new Ghost(this);
		this.physics.add.collider([this.player, this.player2, this.ghost], this.wallsLayer);
	}
	update() {
		this.physics.world.wrap([this.player, this.player2, this.ghost], CONFIG.FRAME_SIZE / 2);
		this.player.move(this.wallsLayer);
		this.player2.move(this.wallsLayer);
		this.ghost.move(this.wallsLayer);
	}
}