const ANIM_KEY = 'sparkle_anim';

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

        scene.anims.create({ key: ANIM_KEY, frames: frames, frameRate: 5 });

        this.p_sprite.alpha = 1;
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
    playAnim() { this.sprite.anims.play(ANIM_KEY, true); }

    /**
     * Desactiva un cuerpo de phaser.
     * @param {boolean} disableGameObject Desactiva el game object.
     * @param {boolean} hideGameObject Oculta el game object.
     */
    disableBody(disableGameObject, hideGameObject) {
        this.sprite.disableBody(disableGameObject, hideGameObject);
    }
}

export default Sparkle;
