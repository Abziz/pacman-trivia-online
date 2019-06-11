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
		this.players = [
			new Pacman(this, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' })),
			new Pacman(this, this.input.keyboard.addKeys({ up: 'W', down: 'S', right: 'D', left: 'A' }))
		];

		this.ghosts = [new Ghost(this)];
		// add a collider between players/ghosts and walls
		this.physics.add.collider([...this.players, ...this.ghosts], this.wallsLayer);
		//check if ghosts are touching the players
		this.physics.add.overlap(this.ghosts, this.players, (g, p) => {
			if (Math.abs(p.body.overlapX) > 3 || Math.abs(p.body.overlapY) > 3) {
				console.log('touch');
			} else {
				console.log('allmost');
			}
		});
	}
	update() {
		this.physics.world.wrap([...this.players, ...this.ghosts], CONFIG.FRAME_SIZE / 2);
		this.players.forEach(p => p.move(this.wallsLayer));
		//	this.player2.move(this.wallsLayer);
		this.ghosts.forEach(g => g.move(this.wallsLayer));
	}
}