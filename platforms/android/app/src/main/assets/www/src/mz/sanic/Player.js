
class Player {


    init(scene, x, y) {
        this.scene = scene;
        this.player = scene.physics.add.sprite(x, y, 'sonic3', 'stand/sonic3_sprites_01.png');

        /* The function generateFrameNames() creates a whole bunch of frame names by creating zero-padded numbers between start and end, 
        surrounded by prefix and suffix). 1 is the start index, 13 the end index and the 2 is the number of digits to use */
        // let standFrames = scene.anims.generateFrameNames('sonic3', {
        //     start: 1, end: 13, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
        // });
        let standFrames = scene.anims.generateFrameNames('sonic3', {
            start: 1, end: 1, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
        });
        let walkFrames = scene.anims.generateFrameNames('sonic3', {
            start: 18, end: 25, zeroPad: 2, prefix: 'walk/sonic3_sprites_', suffix: '.png'
        });
        let jumpFrames = scene.anims.generateFrameNames('sonic3', {
            start: 55, end: 55, zeroPad: 2, prefix: 'jump/sonic3_sprites_', suffix: '.png'
        });

        /* creamos la animacion del movimiento hacia la izquierda */
        scene.anims.create({ key: 'left', frames: walkFrames, frameRate: 10, repeat: -1 });
        /* creamos la animacion de quedarse quieto */
        scene.anims.create({ key: 'stand', frames: standFrames, frameRate: 1, repeat: -1 });
        /* creamos la animacion del movimiento hacia la derecha */
        scene.anims.create({ key: 'right', frames: walkFrames, frameRate: 10, repeat: -1 });
        /* creamos la animacion de salto */
        scene.anims.create({ key: 'jump', frames: jumpFrames, frameRate: 1, repeat: -1 });
    }

    get sprite() { return this.player; }

    get body() { return this.player.body; }

    get velocity() { return this.player.body.velocity; }

    get x() { return this.player.x; }

    get anims() { return this.player.anims; }

    /**
     * Voltea sprite del jugador.
     * 
     * @param {Boolean} value True para voltear sprite.
     */
    set flipX(value) { this.player.flipX = value; }

    /**
     * Establece el rebote del jugador
     * @param {Number} value Valor de rebote.
     */
    setBounce(value) { this.player.setBounce(value); }

    /**
     * Determina si el sprite del jugador debe rebotar contra los limites del mundo o no.
     * @param {Boolean} value True para que el sprite del jugador rebote.
     */
    setCollideWorldBounds(value) { this.player.setCollideWorldBounds(value); }

    /**
     * Establece la velocidad Horizontal
     * @param {Number} value valor de velocidad.
     */
    setVelocityX(value) { this.sprite.setVelocityX(value); }

    /**
     * Establece la velocidad Vertical
     * @param {Number} value valor de velocidad.
     */
    setVelocityY(value) { this.sprite.setVelocityY(value); }

    /**
     * Rota el sprite del jugador
     * @param {Number} degrees Grados horarios de rotacion.
     */
    rotate(degrees) { this.player.angle = this.player.angle + degrees; }

    /**
     * Reproduce una animacion.
     * @param {String} anim Nombre de la animacion.
     * @param {Boolean} ignoreIfPlaying If an animation is already playing then ignore this call.
     */
    playAnim(anim, ignoreIfPlaying = true) { this.sprite.anims.play(anim, ignoreIfPlaying); }


    /**
     * Actualiza el estado del jugador a partir de los inputs del mundo real.
     * @param {Object} inputStatus inputs del mundo real. 
     */
    update({ pressLeft, pressRight, jump, standing }) {
        if (jump) {
            this.setVelocityY(-330);
            //this.playAnim('jump', true);
            return;
        }

        if(standing) {
            if(pressLeft) {
                this.setVelocityX(-160);
                this.playAnim('left', true);
                this.flipX = true;
                return;    
            }

            if(pressRight) {
                this.setVelocityX(160);
                this.playAnim('right', true);
                this.flipX = false;
                return;    
            }

            this.setVelocityX(0);
            this.playAnim('stand', true);
            return;
        } else {
            // jugador esta en el aire
            //this.playAnim('jump', true);
        }
    }
}

export default Player;
