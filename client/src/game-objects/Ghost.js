import Phaser from 'phaser';
import { CONFIG, SPRITES, ANIMATIONS, DIRECTIONS } from '../constants';
export class Ghost extends Phaser.GameObjects.Sprite {
	constructor(scene, x = 32 * 12 + 16, y = 32 * 10 + 16) {
		super(scene, x, y, SPRITES.GHOST);
		this.scene.add.existing(this); // add our sprite to the scene
		this.scene.physics.world.enable(this); // add physics to our sprite	
		this.createAnimations();
		this.body.setVelocityX(150);
		this.turning = false;
	}
	/**
	 * 
	 * @param {Phaser.Tilemaps.StaticTilemapLayer} walls 
	 */
	move(walls) {
		// get the current tile the ghost is walking on
		const current = walls.getTileAtWorldXY(this.x, this.y, true);
		// if current is null we are crossing the screen
		if (current == null) {
			return;
		}
		// get the neighbors
		const neighbors = [
			{ tile: walls.getTileAt(current.x, current.y - 1), direction: DIRECTIONS.UP },
			{ tile: walls.getTileAt(current.x, current.y + 1), direction: DIRECTIONS.DOWN },
			{ tile: walls.getTileAt(current.x + 1, current.y), direction: DIRECTIONS.RIGHT },
			{ tile: walls.getTileAt(current.x - 1, current.y), direction: DIRECTIONS.LEFT }
		];

		if (this.moved && !Phaser.Math.Fuzzy.Equal(current.getCenterX(), this.x, 2) || !Phaser.Math.Fuzzy.Equal(current.getCenterY(), this.y, 2)) {
			return;
		}

		// get the available possible psa
		const available = neighbors
			.filter(x => x.tile == null)
			.filter(({ direction }) => (direction + 180) % 180 != (this.direction + 180) % 180);
		if (available.length == 0) {
			console.log(available.length);
			return;
		}
		const { direction } = Phaser.Math.RND.pick(available);

		if (!this.turning) {
			if (!this.direction || this.direction != direction) {
				this.body.reset(current.getCenterX(), current.getCenterY());
				this.scene.physics.velocityFromAngle(direction + 180, 150, this.body.velocity);
				this.anims.play(`${ANIMATIONS.GHOST}_${direction}`);
				this.direction = direction;
			}
			this.turning = true;
			setTimeout(() => {
				this.turning = false;
			}, 200);
		}
		this.moved = true;
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