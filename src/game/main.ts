import { bootScene } from './scenes/bootScene';
import { AUTO, Game } from 'phaser';
import { preloadScene } from './scenes/preloadScene';
import TavernScene from './scenes/tavernScene';
import { loginScene } from './scenes/loginScene';
import DriftBottleScene from './scenes/DriftBottleScene';
import BottleDetailScene from './scenes/BottleDetailScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: Math.min(window.innerWidth, 550),
    height: Math.min(window.innerHeight, 1195),
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Math.min(window.innerWidth, 550),
        height: Math.min(window.innerHeight, 1195),
        min: {
            width: 300,
            height: 600
        },
        max: {
            width: 550,
            height: 1195
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [
        bootScene,
        loginScene,
        preloadScene,
        TavernScene,
        DriftBottleScene,
        BottleDetailScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
