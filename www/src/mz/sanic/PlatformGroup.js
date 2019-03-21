
class PlatformGroup {
    constructor(scene) {
        this.scene = scene;
    }

    get physics() { return this.scene.physics; }

    init() {
        this.platforms = this.physics.add.staticGroup();
    }

    create(x, y, scale = 1) {
        return this.platforms
            .create(x, y, 'ground')
            .setScale(scale)
            .refreshBody();
    }
}

export default PlatformGroup;