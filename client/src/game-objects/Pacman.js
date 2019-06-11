import Phaser from 'phaser';
import { SPRITES, ANIMATIONS, DIRECTIONS } from '../constants';


export class Pacman extends Phaser.GameObjects.Sprite {
	constructor(scene, inputs, x = 48, y = 48) {
		super(scene, x, y, SPRITES.PACMAN, 3);
		this.scene.add.existing(this); // add our sprite to the scene
		this.scene.physics.world.enable(this); // add physics to our sprite
		this.inputs = inputs;
		this.setOrigin(0.5, 0.5);
		this.body.setVelocity(0, 0);
		this.animation = scene.anims.create({
			key: ANIMATIONS.PACMAN + Pacman.Count++,
			frames: scene.anims.generateFrameNumbers(SPRITES.PACMAN, { frames: [3, 2, 1, 0] }),
			frameRate: 12,
			yoyo: false,
			repeat: -1,
		});

		this.anims.play(this.animation);
		this.animation.pause();
	}

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
		// if trying to turn left or right check if we're close enough on the y axis
		if ((direction == DIRECTIONS.LEFT || direction == DIRECTIONS.RIGHT) && !Phaser.Math.Fuzzy.Equal(this.y, current.getCenterY(), 4)) {
			return;
		}
		// if trying to turn up or down check if we're close enough on the x axis
		if ((direction == DIRECTIONS.UP || direction == DIRECTIONS.DOWN) && !Phaser.Math.Fuzzy.Equal(this.x, current.getCenterX(), 4)) {
			return;
		}
		// turn and position the pacman exactly on the tile
		this.setAngle(direction);
		this.body.reset(current.getCenterX(), current.getCenterY());
	}

	move(walls) {
		// get the current tiles and its neighbors
		const current = walls.getTileAtWorldXY(this.x, this.y, true);
		// if there's no current tile ( which means we are moving through the screen) dont do anything
		if (!current) {
			return;
		}
		// get the neighbor tiles
		const { up, down, right, left } = this.inputs;
		const neighbors = {
			up: walls.getTileAt(current.x, current.y - 1),
			down: walls.getTileAt(current.x, current.y + 1),
			right: walls.getTileAt(current.x + 1, current.y),
			left: walls.getTileAt(current.x - 1, current.y),
		};
		// if we try to move forward and there's a wall in front stop stop the animation
		if (this.angle == DIRECTIONS.UP && neighbors.up ||
			this.angle == DIRECTIONS.DOWN && neighbors.down ||
			this.angle == DIRECTIONS.RIGHT && neighbors.right ||
			this.angle == DIRECTIONS.LEFT && neighbors.left
		) {
			this.animation.pause();
		}
		// check if a key is down and if we can turn ( if we turn backwards its ok!)
		if (up.isDown) {
			this.turn(DIRECTIONS.UP, current, neighbors.up);
			this.animation.resume();

		}
		else if (down.isDown) {
			this.turn(DIRECTIONS.DOWN, current, neighbors.down);
			this.animation.resume();
		}
		else if (left.isDown) {
			this.turn(DIRECTIONS.LEFT, current, neighbors.left);
			this.animation.resume();
		}
		else if (right.isDown) {
			this.turn(DIRECTIONS.RIGHT, current, neighbors.right);
			this.animation.resume();
		}
		const { x, y } = this.scene.physics.velocityFromAngle(this.angle, -200);
		this.body.setVelocity(x, y);
	}

}
Pacman.Count = 0;


