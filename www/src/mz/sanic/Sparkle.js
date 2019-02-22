import Phaser from 'phaser';

const ANIM_KEY = 'sparkle_anim';

const EMPTY_LAMBDA = () => { };

const ANIM_DURATION_MS = 500;

class Sparkle {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Inicializa el Sparkle en una posicion.
     * @param {Number} x Posicion x.
     * @param {Number} y Posicion y.
     */
    init(x, y) {
        const scene = this.scene;
        this.p_sprite = scene.physics.add.staticSprite(x, y, 'sparkle', 'sonic2_sparkles_01.png');

        const frames = scene.anims.generateFrameNames('sparkle', {
            start: 1, end: 5, zeroPad: 2, prefix: 'sonic2_sparkles_', suffix: '.png'
        });

        scene.anims.create({ key: ANIM_KEY, frames: frames, duration: ANIM_DURATION_MS });

        this.p_sprite.on('animationcomplete', () => {
            this.disableBody(true, true);
        });
    }

    get sprite() { return this.p_sprite; }

    get body() { return this.sprite.body; }

    get velocity() { return this.sprite.body.velocity; }

    get x() { return this.sprite.x; }

    get anims() { return this.sprite.anims; }

    get angle() { return this.sprite.angle; }

    /**
     * Establece la posicion.
     * @param {Number} x posicion x.
     * @param {Number} y posicion y.
     */
    setPosition(x, y) { this.sprite.setPosition(x, y); }


    /**
     * Reproduce la animacion.
     */
    playAnim(afterPlay = null) {
        this.sprite.anims.play(ANIM_KEY, true);
        if (afterPlay) setTimeout(afterPlay, ANIM_DURATION_MS);
    }

    /**
     * Desactiva un cuerpo de phaser.
     * @param {boolean} disableGameObject Desactiva el game object.
     * @param {boolean} hideGameObject Oculta el game object.
     */
    disableBody(disableGameObject, hideGameObject) {
        this.sprite.disableBody(disableGameObject, hideGameObject);
    }

    /**
     * Activa el cuerpo del sprite
     * @param {Boolean} reset Resetea el cuerpo del objeto y lo posiciona en (x,y)
     * @param {Number} x posicion x
     * @param {Number} y posicion y
     * @param {Boolean} enableGameObject Activa el objeto
     * @param {Boolean} showGameObject Muestra el objeto
     */
    enableBody(reset, x, y, enableGameObject, showGameObject) {
        this.sprite.enableBody(reset, x, y, enableGameObject, showGameObject);
    }

    disableSparkle(animation) {
        console.log("Disabling sparkle");
    }
}

export default Sparkle;
