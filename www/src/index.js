import Phaser from 'phaser';
import Preloader from './mz/sanic/preloader';
import Background from './mz/sanic/Background';
import Player from './mz/sanic/Player';
import GameText from './mz/sanic/GameText';
import Sparkle from './mz/sanic/Sparkle';

// set to either landscape
screen.orientation.lock('portrait-primary');

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 768;

const GRAVITY_VAL = 300;

document.addEventListener('deviceready', function () {
    // create a new scene named "Game"
    let gameScene = new Phaser.Scene('Game');

    const worldWidth = Math.min(window.innerWidth, MAX_WIDTH);
    const half_worldWidth = worldWidth / 2;
    const worldHeight = Math.min(window.innerHeight, MAX_HEIGHT);
    const half_worldHeight = worldHeight / 2;

    let config = {
        type: Phaser.AUTO,
        width: worldWidth,
        height: worldHeight,
        parent: 'main',
        scene: gameScene,
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: GRAVITY_VAL }, debug: true }
        },
    };

    let game = new Phaser.Game(config);

    const preloader = new Preloader(gameScene);

    const player = new Player(gameScene); // objeto del heroe
    const sparkle = new Sparkle(gameScene); // objeto brillo o sparkle
    let cursors; // manejador de teclado

    let score = 0;
    const scoreText = new GameText(gameScene);
    const angleText = new GameText(gameScene);

    let gameOver; // condicion de fin de juego
    let bombs; // grupo de bombas

    let bg; // background

    gameScene.preload = function () {
        preloader.init();
    };

    gameScene.create = function () {
        // window.addEventListener('resize', resize);
        // resize();

        //background = this.add.tileSprite(0, 0, 400, 300, 'sky');
        //this.add.image(400, 300, 'sky');
        //bg = this.add.tileSprite(100, 450, 800, 800,  'background');
        bg = new Background(this, worldWidth / 2, worldHeight / 2, worldWidth, worldHeight);

        scoreText.init(0, 0, 'Score: 0');
        angleText.init(0, 32, 'Angle: 0');

        /* creo un grupo de cuerpos estaticos con iguales propiedades */
        /* this.physics refiere al objeto physics declarado en la configuracion */
        let platforms = this.physics.add.staticGroup();

        /* we scale this platform x2 with the function setScale(2) */
        /* The call to refreshBody() is required because we have scaled a static physics body, so we have to tell the physics world about the changes we made */
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // parametros: posX , posY , sprite
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        /* creamos al heroe o jugador----------------------------------------------------------------------------------------------------------------------- */
        // agregamos un ArcadeSprite del jugador
        player.init(100, 450);

        sparkle.init(100, 450);
        sparkle.disableBody(true, true);

        player.setOnLandSuccess(() => {
            sparkle.enableBody(true, player.x, player.y, true, true);
            sparkle.setPosition(player.x, player.y + player.width / 2);
            sparkle.playAnim();
            //sparkle.playAnim(() => sparkle.disableBody(true, true));
        });

        /* Con esta funcion podemos establecer los limites de la camara */
        //this.cameras.main.setBounds(0, 0, 800, 600);
        // la camara principal sigue al jugador
        this.cameras.main.startFollow(player.sprite);
        this.cameras.main.setZoom(1);

        /* when it lands after jumping it will bounce ever so slightly */
        player.setBounce(0.0);
        /* Esta funcion hace que el personaje colisione con los limites del juego */
        player.setCollideWorldBounds(false);

        /* In order to allow the player to collide with the platforms we can create a Collider object. 
        This object monitors two physics objects (which can include Groups) and checks for collisions or overlap between them. 
        If that occurs it can then optionally invoke your own callback, but for the sake of just colliding with platforms we don't require that */
        this.physics.add.collider(player.sprite, platforms, player.handlePlatforms());

        //Phaser has a built-in Keyboard manager 
        //This populates the cursors object with four properties: up, down, left, right, that are all instances of Key objects. 
        cursors = this.input.keyboard.createCursorKeys();

        //Let's drop a sprinkling of stars into the scene and allow the player to collect them ----------------------------------------------------
        //Groups are able to take configuration objects to aid in their setup
        let stars = this.physics.add.group({
            key: 'star', //texture key to be the star image by default

            repeat: 6, //Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total

            //this is used to set the position of the 12 children the Group creates. Each child will be placed starting at x: 12, y: 0 and with an x step of 70
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(stars, platforms);

        //This tells Phaser to check for an overlap between the player and any star in the stars Group
        //this.physics.add.overlap(player, stars, collectStar, null, this);
        this.physics.add.overlap(player.sprite, stars, (_, star) => {
            star.disableBody(true, true);

            score += 10;
            scoreText.setText('Score: ' + score);

            //We use a Group method called countActive to see how many stars are left alive
            if (stars.countActive(true) === 0) {
                //enableBody(reset, x, y, enableGameObject, showGameObject)
                stars.children.iterate(child => child.enableBody(true, child.x, 0, true, true));
                let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                let bomb = bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(false);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        });

        // se agregan las bombas ---------------------------------------------------------------------------------
        bombs = this.physics.add.group();

        this.physics.add.collider(bombs, platforms);

        this.physics.add.collider(player.sprite, bombs, (p, _) => {
            this.physics.pause();
            p.setTint(0xff0000);
            p.anims.play('turn');
            gameOver = true;
        });

        console.log({ player });
    }

    gameScene.update = function () {
        //document.querySelector("#title").innerHTML = JSON.stringify({ x: this.input.pointer1.x, y: this.input.pointer1.y });
        //document.querySelector("#title").innerHTML = screen.orientation.type;

        if (gameOver) return;

        const playerStatus = {
            pressLeft: cursors.left.isDown || (this.input.pointer1.isDown && this.input.pointer1.x <= half_worldWidth),
            pressRight: cursors.right.isDown || (this.input.pointer1.isDown && this.input.pointer1.x > half_worldWidth),
            pressJump: cursors.up.isDown || (this.input.pointer1.isDown && this.input.pointer1.y < half_worldHeight)
        };

        //console.log(JSON.stringify(playerStatus));
        player.update(playerStatus);

        angleText.setText('Angle: ' + (parseInt(player.angle / 10) * 10));

        bg.update(player.body.velocity.x, player.body.velocity.y);
    }
});