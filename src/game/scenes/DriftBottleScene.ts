// scenes/DriftBottleScene.ts
import Phaser from 'phaser';
import Player from '../heroes/player';
import Barman from '../heroes/barman';;
import { EventBus } from '../EventBus';

export default class DriftBottleScene extends Phaser.Scene {
  private player!: Player;
  private barman?: Barman;
  private obstrucleGroup?: Phaser.Physics.Arcade.StaticGroup;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private gridSize!: number;

  private currentTween?: Phaser.Tweens.Tween;

  private isBottleUIVisible = true;

  private pageScale = {x: 550, y: 1195};

  private htmlBorder = {x: 70, y: 100};

  private bgLocation = {x: 0, y: 200};

  
  constructor() {
    super('DriftBottleScene');
  }

  create() {
    // 初始化时更新 React 层内容
    // EventBus.emit('scene-switch', this.scene.key, 'Welcome to DriftBottleScene!');
    EventBus.emit('switch-driftbottle-scene');

    // 创建背景并设置固定大小
    // const bg = this.creactBG();
    // this.updateHtmlPosition(bg);
    // 设置相机边界
    this.cameras.main.setBounds(0, 0, this.pageScale.x, this.pageScale.y);
    // 创建返回按钮，固定在屏幕上
    // this.creactBack();

    this.closeMailListener();

    // this.createOpenBottleListener();
  }

  update(time: number, delta: number) {

  }

  private creactBG() {
    const bg = this.add.image(this.bgLocation.x, this.bgLocation.y, 'driftbottle_bg')
        .setOrigin(0, 0)
        .setScale(1.3);
    return bg;    
  }

  private creactBack() {
    const backButton = this.add.image(this.scale.width/2, this.bgLocation.y, 'back')
    .setScale(3)
    .setInteractive()
    .setOrigin(1, 0)
    .setScrollFactor(0);  // 固定在屏幕上

    backButton.on('pointerup', () => {
        // 点击返回时，通知 React
        EventBus.emit('switch-driftbottle-scene');

        this.scene.stop();
        this.scene.resume('tavernScene');
    })
  }

  private updateHtmlPosition(bg: Phaser.GameObjects.Image) {
    let {top, left} = this.getElementScreenPosition(bg);
    top += this.htmlBorder.y
    left += this.htmlBorder.x

    EventBus.emit('update-htmllocation', {top, left});
  }

  private getElementScreenPosition(element: Phaser.GameObjects.Image) {
    const bounds = element.getBounds(); // 获取元素的边界
    const worldView = this.cameras.main.worldView; // 当前摄像机视图
    const scale = this.cameras.main.zoom; // 缩放比例

    return {
      top: (bounds.y - worldView.y) * scale, // Y 坐标
      left: (bounds.x - worldView.x) * scale, // X 坐标
    };
  }

//   private handleOpenDetailScene = 

  private createOpenBottleListener() {
    EventBus.on('open-bottle-detail-scene', () => {
        this.scene.pause();
        this.scene.launch('BottleDetailScene');
      });

    this.events.on('shutdown', () => {
        EventBus.removeListener('open-bottle-detail-scene');
    });
  }

  private closeMailListener() {
    EventBus.on('close-mail', () => {
        this.scene.stop();
        this.scene.resume('tavernScene');
    });
  }

}
