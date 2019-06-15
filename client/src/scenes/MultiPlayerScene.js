import Phaser from 'phaser';
import { SCENES, TILEMAPS, CONFIG, TILESETS } from '../constants';
import { Pacman } from '../game-objects/Pacman';
import { Ghost } from '../game-objects/Ghost';
import { socket } from '../socket';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../../../shared/src/socket-events';
const positions = [{ x: 6, y: 12 }, { x: 18, y: 12 }];
export class MultiPlayerScene extends Phaser.Scene {

	constructor() {
		super({ key: SCENES.MULTIPLAYER });

	}
	init({ roomId, players }) {
		this.roomId = roomId;
		this.isMaster = players[0] === socket.id;
		this.players = players;
	}
	preload() {

	}

	create() {
		this.level = this.add.tilemap(TILEMAPS.LEVEL, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.WIDTH_TILES, CONFIG.HEIGHT_TILES);
		this.levelTileset = this.level.addTilesetImage('pokemon_32x32', TILESETS.POKEMON);
		this.backgroundLayer = this.level.createStaticLayer('background', this.levelTileset);
		this.wallsLayer = this.level.createStaticLayer('walls', this.levelTileset);
		this.wallsLayer.setCollisionByProperty({ wall: true });
		this.playersMap = {};
		this.players = this.players.map((id, index) => {
			const { x, y } = positions[index];
			if (id === socket.id) {
				this.me = new Pacman(this, x, y, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' }));
				return this.me;
			} else {
				return this.playersMap[id] = new Pacman(this, x, y);
			}
		});

		this.ghosts = [
			new Ghost(this, 11, 7),
			new Ghost(this, 13, 7),
			new Ghost(this, 11, 8),
			new Ghost(this, 13, 8),
		];
		window.ghosts = this.ghosts;
		window.walls = this.wallsLayer;
		// add a collider between players/ghosts and walls
		this.physics.add.collider(this.players, this.wallsLayer);
		this.physics.add.collider(this.ghosts, this.wallsLayer);
		//check if ghosts are touching the players
		this.physics.add.overlap(this.ghosts, this.players, (g, p) => {
			if (Math.abs(p.body.overlapX) > 3 || Math.abs(p.body.overlapY) > 3) {
				console.log('touch');
			} else {
				console.log('allmost');
			}
		});

		this.setUpListeners();
		this.setUpEmitters();
	}
	setUpEmitters() {
		this.updateInterval = setInterval(() => {
			socket.emit(CLIENT_EVENTS.MOVE, {
				x: this.me.x,
				y: this.me.y,
				angle: this.me.angle,
			});
			if (this.isMaster) {
				socket.emit(CLIENT_EVENTS.UPDATE, this.ghosts.map(g => {
					return {
						x: g.x,
						y: g.y,
						direction: g.direction
					};
				}));
			}
		}, CONFIG.UPDATE_RATE);
	}
	setUpListeners() {
		socket.on(SERVER_EVENTS.USER_MOVED, (id, { x, y, angle }) => {
			const pacman = this.playersMap[id];
			pacman.setX(x);
			pacman.setY(y);
			pacman.setAngle(angle);
			pacman.updateVelocity();
			pacman.playAnimation();
		});
		socket.on(SERVER_EVENTS.UPDATE, ({ ghosts }) => {
			ghosts.forEach((g, index) => {
				const ghost = this.ghosts[index];
				ghost.setX(g.x);
				ghost.setY(g.y);
				if (ghost.direction !== g.direction) {
					ghost.direction = g.direction;
					ghost.turn();
				}


			});

		});
		socket.on(SERVER_EVENTS.USER_LEFT, (id) => {
			const player = this.playersMap[id];
			const pindex = this.players.indexOf(player);
			player.destroy();
			this.players.splice(pindex, 1);
		});

	}
	update() {

		this.physics.world.wrap([...this.players, ...this.ghosts], CONFIG.FRAME_SIZE / 2);
		this.me.move(this.wallsLayer);
		this.ghosts.forEach(g => g.turn());
		if (this.isMaster) {
			this.ghosts.forEach(g => g.move(this.wallsLayer));
		}
	}
}