

class Background {
    constructor(scene, x, y, w, h) {
        this.scene = scene;
    }

    init(x, y, w, h) {
        let bg = this.scene.add.tileSprite(x, y, w, h, 'background');
        bg.scrollFactorX = 0;
        bg.scrollFactorY = 0;
        this.bg = bg;
    }

    update(vx, vy) {
        this.bg.tilePositionX += vx * 0.01 //change this to a value suited for your needs change - to + to change direction
        this.bg.tilePositionY += vy * 0.01 //change this to a value suited for your needs change - to + to change direction
    }
}

export default Background;