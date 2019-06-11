import Phaser from 'phaser';
import { SPRITES, ANIMATIONS, DIRECTIONS } from '../constants';
export class Ghost extends Phaser.GameObjects.Sprite {
	constructor(scene, x = 32 * 8 + 16, y = 32 * 5 + 16) {
		super(scene, x, y, SPRITES.GHOST);
		this.scene.add.existing(this); // add our sprite to the scene
		this.scene.physics.world.enable(this); // add physics to our sprite	
		this.createAnimations();
		this.turning = false;
	}
	/**
	 * moves the ghost according to the walls layer
	 * @param {Phaser.Tilemaps.StaticTilemapLayer} walls 
	 */
	move(walls) {
		// get the current tile the ghost is walking on 
		const current = walls.getTileAtWorldXY(this.x, this.y, true);
		// if current is null we are crossing the screen
		if (current == null) {
			return;
		}
		// get the neighbors (null if none)
		const neighbors = [
			{ tile: walls.getTileAt(current.x, current.y - 1), direction: DIRECTIONS.UP },
			{ tile: walls.getTileAt(current.x, current.y + 1), direction: DIRECTIONS.DOWN },
			{ tile: walls.getTileAt(current.x + 1, current.y), direction: DIRECTIONS.RIGHT },
			{ tile: walls.getTileAt(current.x - 1, current.y), direction: DIRECTIONS.LEFT }
		];
		// do nothing if we moved allready and we don't meet the threshold for turning 
		if (!Phaser.Math.Fuzzy.Equal(current.getCenterX(), this.x, 2) || !Phaser.Math.Fuzzy.Equal(current.getCenterY(), this.y, 2)) {
			return;
		}

		// get the available directions except behind us
		const available = neighbors
			.filter(x => x.tile == null)
			.filter(({ direction }) => direction == this.direction || (direction + 180) % 180 != (this.direction + 180) % 180);
		if (available.length == 0) {
			return;
		}
		// take one direction at random
		const { direction } = Phaser.Math.RND.pick(available);

		// check if the ghos is turning allready
		if (!this.turning) {
			//if not then check if we need to change the animation / velocity 
			if (this.direction != direction) {
				this.body.reset(current.getCenterX(), current.getCenterY());
				this.scene.physics.velocityFromAngle(direction + 180, 150, this.body.velocity);
				this.anims.play(`${ANIMATIONS.GHOST}_${direction}`);
				this.direction = direction;
			}
			//indicate that the ghost is turning and toggle it back after 1/5 of second
			this.turning = true;
			setTimeout(() => {
				this.turning = false;
			}, 200);
		}
	}



	createAnimations() {
		this.scene.anims.create({
			key: `${ANIMATIONS.GHOST}_${DIRECTIONS.DOWN}`,
			frames: this.scene.anims.generateFrameNumbers(SPRITES.GHOST, { frames: [0, 1] }),
			frameRate: 4,
			yoyo: false,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `${ANIMATIONS.GHOST}_${DIRECTIONS.UP}`,
			frames: this.scene.anims.generateFrameNumbers(SPRITES.GHOST, { frames: [2, 3] }),
			frameRate: 4,
			yoyo: false,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `${ANIMATIONS.GHOST}_${DIRECTIONS.LEFT}`,
			frames: this.scene.anims.generateFrameNumbers(SPRITES.GHOST, { frames: [4, 5] }),
			frameRate: 4,
			yoyo: false,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `${ANIMATIONS.GHOST}_${DIRECTIONS.RIGHT}`,
			frames: this.scene.anims.generateFrameNumbers(SPRITES.GHOST, { frames: [6, 7] }),
			frameRate: 4,
			yoyo: false,
			repeat: -1,
		});
	}
}