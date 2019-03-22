import Phaser from 'phaser';
import Preloader from './Preloader';
import Background from './Background';
import Player from './Player';
import GameText from './GameText';
import Sparkle from './Sparkle';
import Explosion from './Explosion';
import BaseScene from './BaseScene';
import PlatformGroup from './PlatformGroup';


class Scene01 extends BaseScene {
    constructor(worldWidth, worldHeight) {
        super(worldWidth, worldHeight)

        this.preloader = new Preloader(this.gameScene);

        this.player = new Player(this.gameScene); // objeto del heroe
        this.sparkle = new Sparkle(this.gameScene); // objeto brillo o sparkle
        this.explosion = new Explosion(this.gameScene); // explosion

        this.platforms = new PlatformGroup(this.gameScene);

        this.score = 0;
        this.scoreText = new GameText(this.gameScene);
        this.angleText = new GameText(this.gameScene);

        this.bg = new Background(this.gameScene);
    }


    preload() {
        console.log("PRELOAD");
        this.preloader.init();
    }

    create() {
        console.log("CREATE");

        // window.addEventListener('resize', resize);
        // resize();

        this.bg.init(this.half_worldWidth, this.half_worldHeight, this.worldWidth, this.worldHeight);
        this.scoreText.init(0, 0, 'Score: 0');
        this.angleText.init(0, 32, 'Angle: 0');
        
        this.platforms.init()
            .create(400, 568, 2)
            .create(600, 400)
            .create(50, 250)
            .create(750, 220);

        this.bombs = this.physics.add.group();

        this.sparkle.init(100, 450);
        this.sparkle.disableBody(true, true);

        this.explosion.init(100, 450);
        this.explosion.disableBody(true, true);

        /* creamos al heroe o jugador----------------------------------------------------------------------------------------------------------------------- */
        // agregamos un ArcadeSprite del jugador

        this.player.init(100, 450);
        this.player.setInputManager({
            checkJumpPress: () => this.checkJumpPress(),
            checkLeftPress: () => this.checkLeftPress(),
            checkRightPress: () => this.checkRightPress()
        });

        this.player.setOnLandSuccess(() => {
            this.sparkle.enableBody(true, this.player.x, this.player.y);
            this.sparkle.setPosition(this.player.x, this.player.y + this.player.width / 2);
            this.sparkle.playAnim();
        });

        this.player.setOnLandFail(() => {
            this.explosion.enableBody(true, this.player.x, this.player.y);
            this.explosion.setPosition(this.player.x, this.player.y);
            this.explosion.playAnim();
            this.player.die();
        });

        this.player.setOnDeath(() => {
            this.physics.pause();
            window.setTimeout(() => {
                this.player.resurrect();
                this.scene.restart();
            }, 1000);
        });

        /* when it lands after jumping it will bounce ever so slightly */
        this.player.setBounce(0.0);
        /* Esta funcion hace que el personaje colisione con los limites del juego */
        this.player.setCollideWorldBounds(false);

        //Let's drop a sprinkling of stars into the scene and allow the player to collect them ----------------------------------------------------
        //Groups are able to take configuration objects to aid in their setup
        this.stars = this.physics.add.group({
            key: 'star', //texture key to be the star image by default
            repeat: 6, //Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total
            setXY: { x: 12, y: 0, stepX: 70 } //this is used to set the position of the 12 children the Group creates. Each child will be placed starting at x: 12, y: 0 and with an x step of 70
        });

        this.stars.children.iterate(function (child) { child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); });

        /* DETECCION DE COLISION ----------------------------------------------------------------------------------------------------------------- */

        /* In order to allow the player to collide with the platforms we can create a Collider object. 
        This object monitors two physics objects (which can include Groups) and checks for collisions or overlap between them. 
        If that occurs it can then optionally invoke your own callback, but for the sake of just colliding with platforms we don't require that */
        this.physics.add.collider(this.player.sprite, this.platforms.group, this.player.platformHandler(() => this.checkJumpPress()));

        this.physics.add.collider(this.stars, this.platforms.group);

        //This tells Phaser to check for an overlap between the player and any star in the stars Group
        //this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
        this.physics.add.overlap(this.player.sprite, this.stars, (_, star) => {
            star.disableBody(true, true);

            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);

            //We use a Group method called countActive to see how many this.stars are left alive
            if (this.stars.countActive(true) === 0) {
                //enableBody(reset, x, y, enableGameObject, showGameObject)
                this.stars.children.iterate(child => child.enableBody(true, child.x, 0, true, true));
                let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                let bomb = this.bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(false);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        });

        this.physics.add.collider(this.bombs, this.platforms.group);

        this.physics.add.collider(this.player.sprite, this.bombs, (p, _) => {
            this.player.die();
        });

        /* MANEJO DE CAMARA ----------------------------------------------------------------------------------------------------------- */

        /* Con esta funcion podemos establecer los limites de la camara */
        //this.cameras.main.setBounds(0, 0, 800, 600);
        // la camara principal sigue al jugador
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(1);
    }


    update() {
        this.player.update();
        this.angleText.setText('Angle: ' + (parseInt(this.player.angle / 10) * 10));
        this.bg.update(this.player.body.velocity.x, this.player.body.velocity.y);
    }
}


export default Scene01;
