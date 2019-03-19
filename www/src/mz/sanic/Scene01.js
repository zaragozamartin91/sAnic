import Phaser from 'phaser';
import Preloader from './Preloader';
import Background from './Background';
import Player from './Player';
import GameText from './GameText';
import Sparkle from './Sparkle';
import Explosion from './Explosion';


class Scene01 {
    constructor(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.half_worldWidth = worldWidth / 2;
        this.half_worldHeight = worldHeight / 2;

        // create a new scene named "Game"
        this.gameScene = new Phaser.Scene('Game');

        this.preloader = new Preloader(this.gameScene);

        this.player = new Player(this.gameScene); // objeto del heroe
        this.sparkle = new Sparkle(this.gameScene); // objeto brillo o sparkle
        this.explosion = new Explosion(this.gameScene); // explosion

        this.score = 0;
        this.scoreText = new GameText(this.gameScene);
        this.angleText = new GameText(this.gameScene);

        this.bg = new Background(this.gameScene);
    }

    get input() { return this.gameScene.input; }

    get physics() { return this.gameScene.physics; }

    get cameras() { return this.gameScene.cameras; }

    /** Obtiene el manejador del puntero tactil */
    get pointer1() { return this.input.pointer1; }

    /** Obtiene el manejador de teclado */
    get cursors() {
        //Phaser has a built-in Keyboard manager 
        //This populates the cursors object with four properties: up, down, left, right, that are all instances of Key objects. 
        if (!this.cs) { this.cs = this.input.keyboard.createCursorKeys(); }
        return this.cs;
    }

    /** Obtiene el SceneManager de esta escena */
    get scene() { return this.gameScene.scene; }

    checkLeftPress() {
        return this.cursors.left.isDown || (this.pointer1.isDown && this.pointer1.x <= this.half_worldWidth);
    }

    checkRightPress() {
        return this.cursors.right.isDown || (this.pointer1.isDown && this.pointer1.x > this.half_worldWidth);
    }

    checkJumpPress() {
        return this.cursors.up.isDown || (this.pointer1.isDown && this.pointer1.y < this.half_worldHeight);
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

        /* creo un grupo de cuerpos estaticos con iguales propiedades */
        /* this.physics refiere al objeto physics declarado en la configuracion */
        this.platforms = this.physics.add.staticGroup();
        /* we scale this platform x2 with the function setScale(2) */
        /* The call to refreshBody() is required because we have scaled a static physics body, so we have to tell the physics world about the changes we made */
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        // parametros: posX , posY , sprite
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

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
        this.physics.add.collider(this.player.sprite, this.platforms, this.player.platformHandler(() => this.checkJumpPress()));

        this.physics.add.collider(this.stars, this.platforms);

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

        this.physics.add.collider(this.bombs, this.platforms);

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

    build() {
        this.gameScene.preload = () => this.preload();
        this.gameScene.create = () => this.create();
        this.gameScene.update = () => this.update();

        return this.gameScene;
    }
}


export default Scene01;
