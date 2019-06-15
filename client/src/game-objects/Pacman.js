import Phaser from 'phaser';
import { SPRITES, ANIMATIONS, DIRECTIONS, CONFIG } from '../constants';


export class Pacman extends Phaser.GameObjects.Sprite {

	constructor(scene, x = 1, y = 1, inputs) {
		super(scene, 32 * x + 16, 32 * y + 16, SPRITES.PACMAN, 3);
		this.scene.add.existing(this); // add our sprite to the scene
		this.scene.physics.world.enable(this); // add physics to our sprite
		this.index = Pacman.Count++;
		this.inputs = inputs;
		this.body.setVelocity(0, 0);
		this.animation = this.scene.anims.create({
			key: `${ANIMATIONS.PACMAN}_${Pacman.Count}`,
			frames: scene.anims.generateFrameNumbers(SPRITES.PACMAN, { frames: [3, 2, 1, 0] }),
			frameRate: 12,
			yoyo: false,
			repeat: -1,
		});
		this.anims.play(this.animation);
		this.animation.pause();

	}



	move(walls) {
		// get the current tiles and its neighbors ( true means it will return an empty tile instead of null)
		const current = walls.getTileAtWorldXY(this.x, this.y, true);
		// if there's no current tile ( which means we are moving through the screen) dont do anything
		if (!current) {
			return;
		}
		// get the neighbor tiles
		const { up, down, right, left } = this.inputs;
		const neighbors = {
			[DIRECTIONS.UP]: walls.getTileAt(current.x, current.y - 1),
			[DIRECTIONS.DOWN]: walls.getTileAt(current.x, current.y + 1),
			[DIRECTIONS.RIGHT]: walls.getTileAt(current.x + 1, current.y),
			[DIRECTIONS.LEFT]: walls.getTileAt(current.x - 1, current.y)
		};

		// check if a key is down and the tile in that direction is not a wall
		if (up.isDown && neighbors[DIRECTIONS.UP] == null) {
			this.turn(DIRECTIONS.UP, current, neighbors.up);
		}
		else if (down.isDown && neighbors[DIRECTIONS.DOWN] == null) {
			this.turn(DIRECTIONS.DOWN, current, neighbors.down);
		}
		else if (left.isDown && neighbors[DIRECTIONS.LEFT] == null) {
			this.turn(DIRECTIONS.LEFT, current, neighbors.left);
		}
		else if (right.isDown && neighbors[DIRECTIONS.RIGHT] == null) {
			this.turn(DIRECTIONS.RIGHT, current, neighbors.right);
		}
		this.playAnimation();
		this.updateVelocity();
	}
	playAnimation() {
		if (this.body.blocked.none) {
			this.animation.resume();
		} else {
			this.animation.pause();
		}
	}
	updateVelocity() {
		this.scene.physics.velocityFromAngle(this.angle + 180, CONFIG.PACMAN_SPEED, this.body.velocity);
	}

	/**
	 * Turns pacman to the given direction
	 * @param {Number} direction  The angle direction we want to turn
	 * @param {Phaser.Tilemaps.Tile} current The current Tile we are on 
	 * @param {Phaser.Tilemaps.Tile} neighbor The Tile we are going to turn to
	 */
	turn(direction, current, neighbor) {
		// if we are moving towards the same direction or if there's a neighbor wall we can't turn 
		if (this.angle == direction || neighbor) {
			return;
		}

		// if we are turning to the opposite direction we can turn
		if (Phaser.Math.Angle.WrapDegrees(direction + 180) == this.angle) {
			this.setAngle(direction);
			return;
		}
		// if we're not close enough to the turning point don't turn
		if (!Phaser.Math.Fuzzy.Equal(this.y, current.getCenterY(), 2) || !Phaser.Math.Fuzzy.Equal(this.x, current.getCenterX(), 2)) {
			return;
		}
		// position pacman perfectly on the turn point
		this.body.stop();
		this.setPosition(current.getCenterX(), current.getCenterY());
		this.body.prev.copy(this.body.position); // 
		this.setAngle(direction);
		return true;
	}



}
Pacman.Count = 0;


