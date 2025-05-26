let collectedCoins = 0;
class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 300;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1200;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    preload() {
        // Load the animated tiles plugin
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        //Index element
        document.getElementById('description').innerHTML = '<h2>Magnet Boy</h2><br> Arrow keys to move // Mouse hover over pipes to gravitate towards them //R to reset';
        // Store one instance of the audio(s)
        this.isMagnetised = false;
        this.magnetiseSound = this.sound.add("magnetise", { volume: 0.2 });

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 96 tiles wide and 40 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 96, 40);
        this.animatedTiles.init(this.map);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.backgroundWall = this.map.createLayer("Background-Wall", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // TODO: Add createFromObjects here
        // Done
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.spawnPoint = this.map.createFromObjects("Spawn Point", {
            name: "Spawn Point",
            key: "tilemap_sheet",
            frame: 111
        });

        this.Finish = this.map.createFromObjects("Finish", {
            name: "Finish",
            key: "tilemap_sheet",
            frame: 67
        });
        //Get cordinates of spawn point
        const spawn = this.map.findObject("Spawn Point", obj => obj.name === "Spawn Point");
        //this.add.image(spawn.x, spawn.y, "tilemap_sheet", 151).setAlpha(0.5);

        // Create animation for coins created from Object layer
        this.anims.create({
            key: 'coinAnim', // Animation key
            frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                {start: 151, end: 152}
            ),
            frameRate: 10,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });

        // Play the same animation for every memeber of the Object coins array
        this.anims.play('coinAnim', this.coins);

        // TODO: Add turn into Arcade Physics here
        //Done
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        /*
        this.coinGroup.getChildren().forEach(coin => {
            console.log(coin.x, coin.y);
            //my.sprite.player.anims.play('walk', true);
            coin.anims.play(true);
        });
        */


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(spawn.x, spawn.y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // TODO: Add coin collision handler
        // Done
        // Config for coin particle
        const coinConfig = {
            frame: "star_05.png",
            lifespan: 100,
            duration: 100,
            //quantity: { min: 0, max: 2 },
            scale: {start: 0, end: .1, ease: 'bounce.out'}
            //ease: 'bounce.out'
            //scale: () => 0.5 + 0.5 * (Math.random() ** 2),
            //speed: { min: 0, max: 32 },
            //gravityY: 32
        };
         // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.add.particles(obj2.x, obj2.y,'kenny-particles',coinConfig)
            collectedCoins++;
            this.totalCoins.setText(`Coins: ${collectedCoins}`);
            this.sound.play("coinCollected", {volume: .3});
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        // movement vfx Done

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['spark_03.png', 'spark_04.png'],
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 64,
            lifespan: 300,
            gravityY: 100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        
        my.vfx.magnetise = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png', 'circle_02.png'],
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 64,
            lifespan: 350,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.magnetise.stop();

        // TODO: add camera code here
        // Done
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        console.log(this.groundLayer.layer.data);

                //Coin text 
        this.totalCoins = this.add.text(this.cameras.main.x, this.cameras.main.y, `Coins: ${collectedCoins}`, { fontSize: '24px', fill: '#fff' });
        
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 200);

        this.physics.world.enable(this.Finish, Phaser.Physics.Arcade.STATIC_BODY);
this.finishGroup = this.add.group(this.Finish);

this.physics.add.overlap(my.sprite.player, this.finishGroup, () => {
    this.scene.start("levelCompletedScene", { coins: collectedCoins });
});

    }

    update() {
        //Update position of coin text to camera
        this.totalCoins.x = this.cameras.main.worldView.x;
        this.totalCoins.y = this.cameras.main.worldView.y;

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            //Done
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing 
            //Done
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }


        //Handle magnetism
        //When cursor is over any tile with the custom property "grapple" = true
        // Make player gravitate towards the cursor / tile
        const pointer = this.input.activePointer;
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;

        const tile = this.groundLayer.getTileAtWorldXY(worldX, worldY);
        
        let shouldMagnetise = false;

        if (tile && tile.properties.grapple) {
            const tileX = tile.getCenterX();
            const tileY = tile.getCenterY();

            const dx = tileX - my.sprite.player.x;
            const dy = tileY - my.sprite.player.y;

            const distanceInPixels = Math.sqrt(dx * dx + dy * dy);
            const tileSize = this.map.tileWidth;  // 18 in your case
            const distanceInTiles = distanceInPixels / tileSize;

            // Only magnetise if player is within 10 tiles
            if (distanceInTiles <= 10) {
                const speed = 300;  // Control magnet pull strength

                shouldMagnetise = true;

                // Normalize and apply velocity toward the tile
                my.sprite.player.setVelocity((dx / distanceInPixels) * speed,(dy / distanceInPixels) * speed);

                const tileWorldX = tile.pixelX + tile.width / 2;
                const tileWorldY = tile.pixelY + tile.height / 2;

                my.vfx.magnetise.emitParticleAt(tileWorldX, tileWorldY, 10);
                /*
                // This audio kept looping over and over
                this.sound.play("magnetise", {volume: .1});
                */
                }
            }
            // === Handle magnetise sound state ===
            if (shouldMagnetise && !this.isMagnetised) {
                this.magnetiseSound.play();
                this.isMagnetised = true;
            } else if (!shouldMagnetise && this.isMagnetised) {
                this.magnetiseSound.stop();
                this.isMagnetised = false;
            }
    }
}