import Phaser from 'phaser';
import Scene01 from './mz/sanic/Scene01';

// set to either landscape
screen.orientation.lock('portrait-primary');

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 768;
const GRAVITY_VAL = 300;

document.addEventListener('deviceready', function () {
    const worldWidth = Math.min(window.innerWidth, MAX_WIDTH);
    const worldHeight = Math.min(window.innerHeight, MAX_HEIGHT);

    // create a new scene named "Game"
    let gameScene = new Scene01(worldWidth, worldHeight).build();

    let config = {
        type: Phaser.AUTO,
        width: worldWidth,
        height: worldHeight,
        parent: 'main',
        scene: gameScene,
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: GRAVITY_VAL }, debug: true }
        },
    };

    let game = new Phaser.Game(config);

});