import AssetLoader from './AssetLoader';

const MAX_SPEED_X = 200;
const MAX_SPEED_Y = 2000;

/* Aceleracion del jugador mientras camina */
const ACCEL = MAX_SPEED_X * 3 / 4;
const HALF_ACCEL = ACCEL / 2;
const TRIPLE_ACCEL = ACCEL * 3;

/* Limite o tolerancia de angulo de caida */
const ANGLE_THRESHOLD = 45;

const EMPTY_LAMBDA = () => { };

/* Variables temporales */
const TEMP = { angle: 0, mustDie: false, landSuccess: false, angularAccel: 0 };

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

        AssetLoader.loadFor(scene, 'player', () => {
            /* The function generateFrameNames() creates a whole bunch of frame names by creating zero-padded numbers between start and end, 
            surrounded by prefix and suffix). 1 is the start index, 13 the end index and the 2 is the number of digits to use */
            // let standFrames = scene.anims.generateFrameNames('sonic3', {
            //     start: 1, end: 13, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
            // });
            const standFrames = scene.anims.generateFrameNames('sonic3', {
                start: 1, end: 1, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
            });
            const walkFrames = scene.anims.generateFrameNames('sonic3', {
                start: 18, end: 25, zeroPad: 2, prefix: 'walk/sonic3_sprites_', suffix: '.png'
            });
            const jumpFrames = scene.anims.generateFrameNames('sonic3', {
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
        });

        /* Seteo la velocidad maxima del sprite en el eje x e y */
        this.player.setMaxVelocity(MAX_SPEED_X, MAX_SPEED_Y);

        this.onLandSuccess = EMPTY_LAMBDA;
        this.onLandFail = EMPTY_LAMBDA;
        this.onDeath = EMPTY_LAMBDA;

        /* Manejadores de input desde el mundo exterior */
        this.checkJumpPress = EMPTY_LAMBDA;
        this.checkLeftPress = EMPTY_LAMBDA;
        this.checkRightPress = EMPTY_LAMBDA;
    }

    get sprite() { return this.player; }

    get body() { return this.player.body; }

    get velocity() { return this.player.body.velocity; }

    get angularVelocity() { return this.body.angularVelocity; }

    get angularAcceleration() { return this.body.angularAcceleration; }

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
     * Establece los manejadores de input (teclado y tactil)
     * @param {Object} inputHandler Manejador de los inputs del mundo exterior. 
     */
    setInputManager({ checkJumpPress, checkLeftPress, checkRightPress }) {
        this.checkJumpPress = checkJumpPress;
        this.checkLeftPress = checkLeftPress;
        this.checkRightPress = checkRightPress;
    }

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

    /**
     * Establece la aceleracion angular del cuerpo.
     * 
     * @param {Number} value Aceleracion angular.
     */
    setAngularAcceleration(value) { this.player.setAngularAcceleration(value); }

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

    touchingDown() { return this.body.touching.down; }

    /**
     * Marca al jugador como muerto
     */
    die() {
        this.sprite.setTint(0xff0000);
        this.sprite.anims.play('stand');
        this.dead = true;

        this.onDeath();
    }

    /**
     * Marca al jugador como vivo
     */
    resurrect() {
        this.dead = false;
    }

    /**
     * Genera un manejador de colision con plataformas.
     * 
     */
    platformHandler() {
        return (_, __) => {
            TEMP.angle = Math.abs(this.angle) % 360;
            TEMP.mustDie = TEMP.angle > ANGLE_THRESHOLD && this.touchingDown();
            TEMP.landSuccess = this.jumped && TEMP.angle <= ANGLE_THRESHOLD && this.touchingDown();

            if (TEMP.mustDie) {
                console.log('MUST DIE! angle: ', TEMP.angle);
                return this.onLandFail();
            }

            if (TEMP.landSuccess) {
                console.log('OUTSTANDING MOVE!');
                this.onLandSuccess();
            }

            /* Verifico si el jugador debe saltar */
            this.jumped = false;
            this.resetRotation();
            if (this.checkJumpPress()) { return this.jump(); }

            this.standed = true;
        };
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
     * Establece la funcion a ejecutar cuando el jugador muere.
     * @param {Function} f funcion a ejecutar cuando el jugador muere.
     */
    setOnDeath(f) { this.onDeath = f; }

    /**
     * Actualiza el estado del jugador a partir de los inputs del mundo real.
     */
    update() {
        //console.log("Vel X: ", this.velocity.x);

        if (this.standed && this.touchingDown()) {
            if (this.checkLeftPress()) { return this.goLeft(); }
            if (this.checkRightPress()) { return this.goRight(); }

            // si no presiono ningun boton...
            if (Math.abs(this.velocity.x) < HALF_ACCEL) {
                this.playAnim('stand', true);
                this.setAccelerationX(0);
                this.setVelocityX(0);
                return;
            }

            this.playAnim(this.goingLeft() ? 'left' : 'right', true);
            return this.setAccelerationX(this.goingLeft() ? ACCEL : -ACCEL);
        }

        if (!this.touchingDown()) {
            this.setAccelerationX(0);
            this.playAnim('jump');

            console.log('Velocidad angular: ', this.angularVelocity);

            if (this.checkLeftPress()) { return this.rotateLeftMidair(); }
            if (this.checkRightPress()) { return this.rotateRightMidair(); }

            return this.setAngularAcceleration(0);
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
        this.initialAngularVelocity = this.velocity.x;
        this.setAngularVelocity(this.initialAngularVelocity);
        this.jumped = true;
        this.standed = false;
    }

    goLeft() {
        this.setAccelerationX(this.goingRight() ? -TRIPLE_ACCEL : -ACCEL);
        this.flipX = true;
        this.playAnim('left', true);
    }

    rotateLeftMidair() {
        TEMP.angularAccel = Math.abs(this.initialAngularVelocity) * -1;
        return this.setAngularAcceleration(TEMP.angularAccel);
    }

    rotateRightMidair() {
        TEMP.angularAccel = Math.abs(this.initialAngularVelocity);
        return this.setAngularAcceleration(TEMP.angularAccel);
    }
}

export default Player;
