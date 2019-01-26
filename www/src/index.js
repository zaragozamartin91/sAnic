import Phaser from 'phaser';
import foo from './foo';
import preload from './mz/sanic/preloader';

document.addEventListener('deviceready', function () {
    foo();

    let config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 300 }, debug: false }
        },
        scene: { preload, create, update }
    };

    let game = new Phaser.Game(config);

    let player; // objeto del heroe
    let cursors; // manejador de teclado

    let score = 0;
    let scoreText;

    let gameOver; // condicion de fin de juego
    let bombs; // grupo de bombas

    function create() {
        console.log(this);

        this.add.image(400, 300, 'sky');

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
        player = this.physics.add.sprite(100, 450, 'sonic3', 'stand/sonic3_sprites_01.png');
        // la camara principal sigue al jugador
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(player);
        this.cameras.main.setZoom(2);

        /* The function generateFrameNames() creates a whole bunch of frame names by creating zero-padded numbers between start and end, 
        surrounded by prefix and suffix). 1 is the start index, 13 the end index and the 2 is the number of digits to use */
        let standFrames = this.anims.generateFrameNames('sonic3', {
            start: 1, end: 13, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
        });
        let walkFrames = this.anims.generateFrameNames('sonic3', {
            start: 18, end: 25, zeroPad: 2, prefix: 'walk/sonic3_sprites_', suffix: '.png'
        });

        /* when it lands after jumping it will bounce ever so slightly */
        player.setBounce(0.2);
        /* As we set the game to be 800 x 600 then the player won't be able to run outside of this area */
        player.setCollideWorldBounds(true);

        console.log("flips...")
        console.log(player.flipX);
        console.log(player.flipY);

        /* creamos la animacion del movimiento hacia la izquierda */
        this.anims.create({ key: 'left', frames: walkFrames, frameRate: 10, repeat: -1 });

        this.anims.create({ key: 'stand', frames: standFrames, frameRate: 1, repeat: -1 });

        /* creamos la animacion del movimiento hacia la derecha */
        this.anims.create({ key: 'right', frames: walkFrames, frameRate: 10, repeat: -1 });

        /* In order to allow the player to collide with the platforms we can create a Collider object. 
        This object monitors two physics objects (which can include Groups) and checks for collisions or overlap between them. 
        If that occurs it can then optionally invoke your own callback, but for the sake of just colliding with platforms we don't require that */
        this.physics.add.collider(player, platforms);

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
        this.physics.add.overlap(player, stars, (_, star) => {
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
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        });

        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        // se agregan las bombas ---------------------------------------------------------------------------------
        bombs = this.physics.add.group();

        this.physics.add.collider(bombs, platforms);

        this.physics.add.collider(player, bombs, (p, _) => {
            this.physics.pause();
            p.setTint(0xff0000);
            p.anims.play('turn');
            gameOver = true;
        });

        console.log({player});
    }

    function update() {
        if (gameOver) return;

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
            player.flipX = true;
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
            player.flipX = false;
        } else {
            player.setVelocityX(0);
            player.anims.play('stand', true);
        }

        // logica de salto
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }
});