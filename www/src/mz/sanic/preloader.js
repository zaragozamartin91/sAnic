class Preloader {
    constructor(scene) {
        this.scene = scene;
    }

    init() {
        this.scene.load.image('sky', 'assets/sky.png');
        this.scene.load.image('ground', 'assets/platform.png');
        this.scene.load.image('star', 'assets/star.png');
        this.scene.load.image('bomb', 'assets/bomb.png');
        this.scene.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    
        this.scene.load.multiatlas('sonic3', 'assets/sonic3.json', 'assets');
    
        // this.scene.load.image('background' , 'assets/background.png');
        this.scene.load.image('background' , 'assets/angel_island_cloud.png');
    
    }
}


export default Preloader;