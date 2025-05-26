class LevelCompleted extends Phaser.Scene {
    constructor() {
        super("levelCompletedScene");
    }

    init(data) {
        this.collectedCoins = data.coins;
    }

    create() {
        this.add.text(100, 100, `Level Completed!`, { fontSize: '32px', fill: '#fff' });
        this.add.text(100, 150, `Coins Collected: ${this.collectedCoins}`, { fontSize: '24px', fill: '#fff' });
        this.add.text(100, 300, `Press Space to restart`, { fontSize: '24px', fill: '#fff' });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start("platformerScene");
        });
    }
}
