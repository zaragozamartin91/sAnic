import Phaser from 'phaser';
import preload from './mz/sanic/preloader';
import Background from './mz/sanic/Background';
import Player from './mz/sanic/Player';

// set to either landscape
screen.orientation.lock('portrait-primary');

document.addEventListener('deviceready', function () {
    // create a new scene named "Game"
    let gameScene = new Phaser.Scene('Game');

    let worldWidth = Math.min(window.innerWidth, 1366);
    let worldHeight = Math.min(window.innerHeight, 768);

    let config = {
        type: Phaser.AUTO,
        width: worldWidth,
        height: worldHeight,
        parent: 'main',
        scene: gameScene,
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 300 }, debug: false }
        },
    };

    let game = new Phaser.Game(config);

    const player = new Player(); // objeto del heroe
    let cursors; // manejador de teclado

    let score = 0;
    let scoreText;

    let gameOver; // condicion de fin de juego
    let bombs; // grupo de bombas

    let bg; // background

    /**
     * Funcion de resize que se ejecutara cada vez que el dispoistivo cambie de tamano o disposicion
     */
    function resize() {
        console.log("RESIZE!");
        let canvas = game.canvas;
        let win_width = window.innerWidth;
        let win_height = window.innerHeight;
        let wratio = win_width / win_height;
        let canvas_ratio = canvas.width / canvas.height;

        if (wratio < canvas_ratio) {
            canvas.style.width = win_width + "px";
            canvas.style.height = (win_width / canvas_ratio) + "px";
        } else {
            canvas.style.width = (win_height * canvas_ratio) + "px";
            canvas.style.height = win_height + "px";
        }

        // canvas.style.width = window.innerWidth + "px";
        // canvas.style.height = window.innerHeight * 0.9 + "px";
    }

    gameScene.preload = preload;

    gameScene.create = function () {
        // window.addEventListener('resize', resize);
        // resize();

        //background = this.add.tileSprite(0, 0, 400, 300, 'sky');
        //this.add.image(400, 300, 'sky');
        //bg = this.add.tileSprite(100, 450, 800, 800,  'background');
        bg = new Background(this, worldWidth / 2, worldHeight / 2, worldWidth, worldHeight);

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
        player.init(gameScene, 100, 450);

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
        this.physics.add.collider(player.sprite, platforms);

        //Phaser has a built-in Keyboard manager 
        //This populates the cursors object with four properties: up, down, left, right, that are all instances of Key objects. 
        cursors = this.input.keyboard.createCursorKeys();

        //Let's drop a sprinkling of stars into the scene and allow the player to collect them ----------------------------------------------------
        //Groups are able to take configuration objects to aid in their setup
        let stars = this.physics.add.group({
            key: 'star', //texture key to be the star image by default

            repeat: 11, //Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total

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

        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

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
        document.querySelector("#title").innerHTML = JSON.stringify({ x: this.input.pointer1.x, y: this.input.pointer1.y });
        //document.querySelector("#title").innerHTML = screen.orientation.type;

        if (gameOver) return;

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
            player.flipX = true;
            //player.flipX(true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
            player.flipX = false;
            //player.flipX(false);
        } else {
            player.setVelocityX(0);
            player.anims.play('stand', true);
        }

        // logica de salto
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }

        bg.update(player.body.velocity.x, player.body.velocity.y);

        // console.log("player.angle: " + player.angle);
        // player.angle = player.angle + 1;


        //console.log("player.body.position.x: " + player.body.position.x);
    }
});