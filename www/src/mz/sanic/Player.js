const MAX_SPEED_X = 200;
const MAX_SPEED_Y = 2000;

const ACCEL = MAX_SPEED_X * 3 / 4;
const HALF_ACCEL = ACCEL / 2;
const DOUBLE_ACCEL = ACCEL * 2;
const TRIPLE_ACCEL = ACCEL * 3;

const ANGLE_THRESHOLD = 45;

const EMPTY_LAMBDA = () => { };

/* Variables temporales */
const TEMP = { angle: 0, mustDie: false };

class Player {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Inicializa el jugador en una posicion.
     * @param {Number} x Posicion x.
     * @param {Number} y Posicion y.
     */
    init(x, y) {
        let scene = this.scene;
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

        /* Seteo la velocidad maxima del sprite en el eje x e y */
        this.player.setMaxVelocity(MAX_SPEED_X, MAX_SPEED_Y);

        this.onLandSuccess = EMPTY_LAMBDA;
        this.onLandFail = EMPTY_LAMBDA;
    }

    get sprite() { return this.player; }

    get body() { return this.player.body; }

    get velocity() { return this.player.body.velocity; }

    get x() { return this.player.x; }

    get y() { return this.player.y; }

    get width() { return this.player.width; }

    get height() { return this.player.height; }

    get anims() { return this.player.anims; }

    get angle() { return this.player.angle; }

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
     * Establece la posicion.
     * @param {Number} x posicion x.
     * @param {Number} y posicion y.
     */
    setPosition(x, y) { this.sprite.setPosition(x, y); }

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
     * Establece la aceleracion Horizontal
     * @param {Number} value Valor de aceleracion. 
     */
    setAccelerationX(value) { this.sprite.setAccelerationX(value); }

    /**
     * Establece la aceleracion Vertical
     * @param {Number} value Valor de aceleracion. 
     */
    setAccelerationY(value) { this.sprite.setAccelerationY(value); }

    /**
     * Rota el sprite del jugador
     * @param {Number} degrees Grados horarios de rotacion.
     */
    rotate(degrees) { this.player.angle = this.player.angle + degrees; }

    /**
     * Establece la velocidad angular del cuerpo.
     * 
     * @param {Number} value Velocidad angular.
     */
    setAngularVelocity(value) { this.player.setAngularVelocity(value); }

    resetRotation() {
        this.player.angle = 0;
        this.setAngularVelocity(0);
    }

    /**
     * Reproduce una animacion.
     * @param {String} anim Nombre de la animacion.
     * @param {Boolean} ignoreIfPlaying If an animation is already playing then ignore this call.
     */
    playAnim(anim, ignoreIfPlaying = true) { this.sprite.anims.play(anim, ignoreIfPlaying); }

    goingLeft() { return this.velocity.x < 0; }

    goingRight() { return !this.goingLeft(); }

    standing() { return this.body.touching.down; }

    /**
     * Marca al jugador como muerto
     */
    die() {
        this.scene.physics.pause();
        this.sprite.setTint(0xff0000);
        this.sprite.anims.play('stand');
        this.dead = true;

        window.setTimeout(() => {
            this.resurrect();
            this.scene.scene.restart();
        }, 1000);
    }

    /**
     * Marca al jugador como vivo
     */
    resurrect() {
        this.dead = false;
    }

    /**
     * Genera un lambda / funcion q maneja la interaccion del jugador con la plataforma.
     */
    handlePlatforms() {
        const self = this;
        return function (_, __) {
            TEMP.angle = Math.abs(self.angle) % 360;
            TEMP.mustDie = TEMP.angle > ANGLE_THRESHOLD && self.standing();

            if (TEMP.mustDie) {
                console.log('MUST DIE! angle: ', TEMP.angle);
                self.onLandFail();
            } else if (self.jumped) {
                console.log('OUTSTANDING MOVE!');
                self.onLandSuccess();
            }
        }
    };

    /**
     * Establece la funcion a ejecutar cuando ocurre un landing exitoso
     * @param {Function} f  funcion a ejecutar cuando ocurre un landing exitoso
     */
    setOnLandSuccess(f) { this.onLandSuccess = f; }

    /**
     * Establece la funcion a ejecutar cuando ocurre un landing fallido
     * @param {Function} f funcion a ejecutar cuando ocurre un landing fallido
     */
    setOnLandFail(f) { this.onLandFail = f; }

    /**
     * Actualiza el estado del jugador a partir de los inputs del mundo real.
     * @param {Object} inputStatus inputs del mundo real. 
     */
    update({ pressLeft, pressRight, pressJump }) {
        //console.log("Vel X: ", this.velocity.x);

        if (this.standing()) {
            this.jumped = false;
            this.resetRotation();

            if (pressJump) { return this.jump(); }

            if (pressLeft) { return this.goLeft(); }

            if (pressRight) { return this.goRight(); }

            // si no presiono ningun boton...
            if (Math.abs(this.velocity.x) < HALF_ACCEL) {
                this.playAnim('stand', true);
                this.setAccelerationX(0);
                this.setVelocityX(0);
                return;
            }

            this.playAnim(this.goingLeft() ? 'left' : 'right', true);
            this.setAccelerationX(this.goingLeft() ? ACCEL : -ACCEL);
        } else {
            // jugador esta en el aire
            //console.log("angle: ", this.angle);

            this.setAccelerationX(0);
            this.playAnim('jump', true);
            //this.rotate(this.velocity.x / 50);
        }
    }

    goRight() {
        this.setAccelerationX(this.goingLeft() ? TRIPLE_ACCEL : ACCEL);
        this.flipX = false;
        this.playAnim('right', true);
    }

    jump() {
        this.setVelocityY(-330);
        this.playAnim('jump', true);
        this.setAngularVelocity(this.velocity.x);
        this.jumped = true;
    }

    goLeft() {
        this.setAccelerationX(this.goingRight() ? -TRIPLE_ACCEL : -ACCEL);
        this.flipX = true;
        this.playAnim('left', true);
    }
}

export default Player;
