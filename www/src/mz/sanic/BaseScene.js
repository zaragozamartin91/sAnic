import Phaser from 'phaser';


class BaseScene {
    constructor(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.half_worldWidth = worldWidth / 2;
        this.half_worldHeight = worldHeight / 2;

        // create a new scene named "Game"
        this.gameScene = new Phaser.Scene('Game');
    }

    get input() { return this.gameScene.input; }

    get physics() { return this.gameScene.physics; }

    get cameras() { return this.gameScene.cameras; }

    /** Obtiene el manejador del puntero tactil */
    get pointer1() { return this.input.pointer1; }

    /** Obtiene el manejador de teclado */
    get cursors() {
        //Phaser has a built-in Keyboard manager 
        //This populates the cursors object with four properties: up, down, left, right, that are all instances of Key objects. 
        if (!this.cs) { this.cs = this.input.keyboard.createCursorKeys(); }
        return this.cs;
    }

    /** Obtiene el SceneManager de esta escena */
    get scene() { return this.gameScene.scene; }

    checkLeftPress() {
        return this.cursors.left.isDown || (this.pointer1.isDown && this.pointer1.x <= this.half_worldWidth);
    }

    checkRightPress() {
        return this.cursors.right.isDown || (this.pointer1.isDown && this.pointer1.x > this.half_worldWidth);
    }

    checkJumpPress() {
        return this.cursors.up.isDown || (this.pointer1.isDown && this.pointer1.y < this.half_worldHeight);
    }


    build() {
        this.gameScene.preload = () => this.preload();
        this.gameScene.create = () => this.create();
        this.gameScene.update = () => this.update();

        return this.gameScene;
    }
}


export default BaseScene;
