
class GameText {
    constructor(scene) {
        this.scene = scene;
    }

    init(x, y, value, cfg = { fontSize: '32px', fill: '#000' }) {
        this.text = this.scene.add.text(x, y, value, cfg);
        this.text.scrollFactorX = 0;
        this.text.scrollFactorY = 0;
    }

    setText(value) { this.text.setText(value); }
}

export default GameText;