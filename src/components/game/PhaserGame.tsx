"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export default function PhaserGame() {
    const gameRef = useRef<HTMLDivElement>(null);
    const { currentPet } = useGameStore();

    useEffect(() => {
        if (!gameRef.current || typeof window === "undefined") return;

        let game: Phaser.Game;

        const initPhaser = async () => {
            const Phaser = (await import("phaser")).default;

            class BootScene extends Phaser.Scene {
                constructor() { super({ key: 'BootScene' }); }

                create() {
                    this.generatePixelArt();
                    this.scene.start('PlayScene');
                }

                generatePixelArt() {
                    const makeFrame = (key: string, pixelData: string[], palette: Record<string, number>) => {
                        const graphics = this.add.graphics();
                        const size = 4; // Scale up 4x internally for retro feel
                        
                        pixelData.forEach((row, y) => {
                            for (let x = 0; x < row.length; x++) {
                                const char = row[x];
                                if (palette[char] !== undefined) {
                                    graphics.fillStyle(palette[char]);
                                    graphics.fillRect(x * size, y * size, size, size);
                                }
                            }
                        });
                        
                        graphics.generateTexture(key, pixelData[0].length * size, pixelData.length * size);
                        graphics.destroy();
                    };

                    const pal = {
                        'O': 0x000000, // Outline
                        'W': 0xffffff, // White
                        'B': 0x8b4513, // Brown (Pet Body)
                        'L': 0xd2b48c, // Light Brown
                        'P': 0xff69b4, // Pink
                        'G': 0x228B22, // Grass
                        'D': 0x134F13, // Dark Grass
                        'T': 0x8B4513, // Trunk
                        'F': 0x654321, // Floor
                        'X': 0x888888, // Stone/Wall
                        'Y': 0xaaaaaa, // Light Stone
                        'Z': 0x4444ff, // Water/Blue
                        'R': 0xff0000, // Red
                        'C': 0xffff00, // Yellow
                    };

                    // Pet Animations
                    const petIdle1 = [
                        "  OOOO  ", " OLLLLO ", " OWWLLO ", "OWOOWLOO", "OWOOWLOO", "OLLLLLLO", " OLLLLO ", "  OOOO  "
                    ];
                    makeFrame('pet_idle', petIdle1, pal);

                    const petWalk = [
                        "  OOOO  ", " OLLLLO ", " OWWLLO ", "OWOOWLOO", "OWOOWLOO", "OLLLLLLO", " OLLLLO ", "  O  O  "
                    ];
                    makeFrame('pet_walk', petWalk, pal);
                    
                    const petSleep = [
                        "        ", "        ", "  OOOO  ", " OLLLLO ", " O----O ", "OLLLLLLO", " OLLLLO ", "  OOOO  "
                    ];
                    makeFrame('pet_sleep', petSleep, pal);

                    // Tiles & Environment
                    const grassTile = [
                        "GGGGGGGG", "GGDGGGGG", "GGGGGGGD", "DGGGGGGG", "GGGGGGGG", "GGGDGGGG", "GGGGGGGG", "GGDGGGGG"
                    ];
                    makeFrame('tile_grass', grassTile, pal);

                    const woodTile = [
                        "FFFFFFFF", "FTTTTFFF", "FFFFFFFF", "FFFTTTTF", "FFFFFFFF", "FTTTFFFF", "FFFFFFFF", "FFFFFFFT"
                    ];
                    makeFrame('tile_wood', woodTile, pal);

                    const floorTile = [
                        "XYXYXYXY", "YXYXYXYX", "XYXYXYXY", "YXYXYXYX", "XYXYXYXY", "YXYXYXYX", "XYXYXYXY", "YXYXYXYX"
                    ];
                    makeFrame('tile_floor', floorTile, pal);

                    const wallTile = [
                        "OXXXXXXO", "OXXXXXXO", "OXXXXXXO", "OXXXXXXO", "OXXXXXXO", "OXXXXXXO", "OXXXXXXO", "OXXXXXXO"
                    ];
                    makeFrame('tile_wall', wallTile, pal);

                    const doorTile = [
                        "OOOOOOOO", "OCCCCCCO", "OCXOOXCO", "OCXOOXCO", "OCXOOXCO", "OCXOOXCO", "OCXOOXCO", "OOOOOOOO"
                    ];
                    makeFrame('tile_door', doorTile, pal);

                    const bedObj = [
                        "OOOOOOOO", "OWWWWWWO", "OWWWWWWO", "ORRRRRRO", "OLLLLLLO", "OLLLLLLO", "OLLLLLLO", "OOOOOOOO"
                    ];
                    makeFrame('obj_bed', bedObj, pal);

                    const bowlObj = [
                        "        ", "        ", "        ", "  OOOO  ", " OWWXXO ", " OBBXXO ", "  OOOO  ", "        "
                    ];
                    makeFrame('obj_bowl', bowlObj, pal);
                }
            }

            class PlayScene extends Phaser.Scene {
                player!: Phaser.Physics.Arcade.Sprite;
                pet!: Phaser.Physics.Arcade.Sprite;
                stateText!: Phaser.GameObjects.Text;
                speechBubble!: Phaser.GameObjects.Container;
                speechText!: Phaser.GameObjects.Text;
                cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
                wasd!: any;
                currentRoom: string = 'Bedroom';
                roomLabel!: Phaser.GameObjects.Text;

                // Environment groups
                walls!: Phaser.Physics.Arcade.StaticGroup;
                doors!: Phaser.Physics.Arcade.StaticGroup;
                furniture!: Phaser.Physics.Arcade.StaticGroup;
                floorTiles: Phaser.GameObjects.Image[] = [];

                constructor() { super({ key: 'PlayScene' }); }

                create() {
                    // Groups for maps
                    this.walls = this.physics.add.staticGroup();
                    this.doors = this.physics.add.staticGroup();
                    this.furniture = this.physics.add.staticGroup();

                    // Controls
                    if (this.input.keyboard) {
                        this.cursors = this.input.keyboard.createCursorKeys();
                        this.wasd = {
                            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                        };
                    }

                    // Procedural Animations
                    if (!this.anims.exists('idle')) {
                        this.anims.create({ key: 'idle', frames: [ { key: 'pet_idle' } ], frameRate: 2, repeat: -1 });
                        this.anims.create({ key: 'walk', frames: [ { key: 'pet_idle' }, { key: 'pet_walk' } ], frameRate: 6, repeat: -1 });
                        this.anims.create({ key: 'sleep', frames: [ { key: 'pet_sleep' } ], frameRate: 1, repeat: -1 });
                    }

                    // Player Avatar
                    this.player = this.physics.add.sprite(200, 200, 'pet_idle').setTint(0x8888ff);
                    this.player.setCollideWorldBounds(true);
                    this.player.play('idle');

                    // Pet Avatar
                    this.pet = this.physics.add.sprite(250, 200, 'pet_idle');
                    this.pet.setCollideWorldBounds(true);
                    this.pet.play('idle');
                    
                    // Build Initial Map
                    this.drawRoom('Bedroom');

                    // Collision Rules
                    this.physics.add.collider(this.player, this.walls);
                    this.physics.add.collider(this.pet, this.walls);
                    this.physics.add.collider(this.player, this.furniture);
                    this.physics.add.collider(this.pet, this.furniture);
                    
                    this.physics.add.overlap(this.player, this.doors, (p, d) => {
                        const door = d as any;
                        if (this.wasd.space.isDown || Phaser.Input.Keyboard.JustDown(this.wasd.space)) {
                            this.transitionRoom(door.targetRoom);
                        }
                    });

                    // UI
                    this.stateText = this.add.text(0, 0, 'Pet', { 
                        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', backgroundColor: '#000000aa'
                    }).setOrigin(0.5);

                    this.roomLabel = this.add.text(10, 10, 'Bedroom', {
                        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', backgroundColor: '#000000dd', padding: { x: 5, y: 5 }
                    }).setScrollFactor(0);

                    // Speech Bubble System
                    this.createSpeechBubble();

                    // Camera follow
                    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                    this.cameras.main.setZoom(1.5);

                    // Autonomous Behavior Timer
                    this.time.addEvent({
                        delay: 3000,
                        callback: this.evaluateAIBehavior,
                        callbackScope: this,
                        loop: true
                    });
                }

                transitionRoom(newRoom: string) {
                    // Flash camera and draw room
                    this.cameras.main.flash(300, 0, 0, 0);
                    this.drawRoom(newRoom);
                    // Reset positions
                    this.player.setPosition(200, 200);
                    this.pet.setPosition(250, 200);
                    this.roomLabel.setText(newRoom);
                }

                drawRoom(roomName: string) {
                    this.currentRoom = roomName;
                    
                    // Clear old environment
                    this.floorTiles.forEach(t => t.destroy());
                    this.floorTiles = [];
                    this.walls.clear(true, true);
                    this.doors.clear(true, true);
                    this.furniture.clear(true, true);

                    const width = 16;
                    const height = 12;
                    this.physics.world.setBounds(0, 0, width * 32, height * 32);
                    
                    // Select aesthetics
                    let bgTile = 'tile_wood';
                    if (roomName === 'Park') bgTile = 'tile_grass';
                    if (roomName === 'Kitchen' || roomName === 'Bathroom') bgTile = 'tile_floor';

                    // Draw Floor
                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {
                            const tile = this.add.image(x * 32, y * 32, bgTile).setOrigin(0, 0);
                            tile.setDepth(-1);
                            this.floorTiles.push(tile);
                        }
                    }

                    // Draw Boundary Walls
                    for (let x = 0; x < width; x++) {
                        this.walls.create(x * 32, 0, 'tile_wall').setOrigin(0,0);
                        this.walls.create(x * 32, (height - 1) * 32, 'tile_wall').setOrigin(0,0);
                    }
                    for (let y = 1; y < height - 1; y++) {
                        this.walls.create(0, y * 32, 'tile_wall').setOrigin(0,0);
                        this.walls.create((width - 1) * 32, y * 32, 'tile_wall').setOrigin(0,0);
                    }

                    // Room specific layouts
                    if (roomName === 'Bedroom') {
                        this.furniture.create(5 * 32, 2 * 32, 'obj_bed');
                        
                        const doorToKitchen = this.doors.create((width - 2) * 32, (height - 2) * 32, 'tile_door') as any;
                        doorToKitchen.targetRoom = 'Kitchen';
                    } 
                    else if (roomName === 'Kitchen') {
                        this.furniture.create(3 * 32, 3 * 32, 'obj_bowl');
                        
                        const doorToBed = this.doors.create(1 * 32, (height - 2) * 32, 'tile_door') as any;
                        doorToBed.targetRoom = 'Bedroom';

                        const doorToPark = this.doors.create((width - 2) * 32, 1 * 32, 'tile_door') as any;
                        doorToPark.targetRoom = 'Park';
                    }
                    else if (roomName === 'Park') {
                        // Less walls in park, tree objects (using bed graphic colored differently for now)
                        this.furniture.create(8 * 32, 6 * 32, 'obj_bed').setTint(0x228b22);
                        
                        const doorToKitchen = this.doors.create(1 * 32, (height - 2) * 32, 'tile_door') as any;
                        doorToKitchen.targetRoom = 'Kitchen';

                        const doorToSchool = this.doors.create((width - 2) * 32, (height - 2) * 32, 'tile_door') as any;
                        doorToSchool.targetRoom = 'School';
                    }
                    else if (roomName === 'School') {
                        const doorToPark = this.doors.create(1 * 32, (height - 2) * 32, 'tile_door') as any;
                        doorToPark.targetRoom = 'Park';
                    }

                    this.walls.refresh();
                    this.doors.refresh();
                    this.furniture.refresh();
                }

                createSpeechBubble() {
                    this.speechBubble = this.add.container(0, 0);
                    const bg = this.add.graphics();
                    bg.fillStyle(0xffffff, 1);
                    bg.fillRoundedRect(-50, -30, 100, 40, 8);
                    
                    // Tail
                    bg.fillTriangle(0, 10, -5, 20, 5, 10);
                    
                    this.speechText = this.add.text(0, -10, 'Woof!', {
                        fontFamily: 'monospace', fontSize: '10px', color: '#000000', align: 'center', wordWrap: { width: 90 }
                    }).setOrigin(0.5);
                    
                    this.speechBubble.add([bg, this.speechText]);
                    this.speechBubble.setAlpha(0);
                }

                showSpeech(text: string, emotion: string = 'normal') {
                    this.speechText.setText(text);
                    this.speechBubble.setAlpha(1);
                    this.speechBubble.y = -20;
                    
                    if (emotion === 'happy' || emotion === 'excited') {
                        this.tweens.add({
                            targets: this.speechBubble,
                            y: -45, duration: 200, yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
                            onComplete: () => this.fadeOutBubble()
                        });
                    } else if (emotion === 'weak') {
                        this.tweens.add({
                            targets: this.speechBubble,
                            alpha: { from: 0, to: 1 }, duration: 1000,
                            onComplete: () => this.time.delayedCall(2000, () => this.fadeOutBubble())
                        });
                        this.speechBubble.y = -40;
                    } else {
                        this.tweens.add({
                            targets: this.speechBubble,
                            y: -40, duration: 200, ease: 'Bounce.Out',
                            onComplete: () => this.time.delayedCall(3000, () => this.fadeOutBubble())
                        });
                    }
                }

                fadeOutBubble() {
                    this.tweens.add({ targets: this.speechBubble, alpha: 0, duration: 300 });
                }

                evaluateAIBehavior() {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pet.x, this.pet.y);
                    
                    // If far away, follow player
                    if (dist > 120) {
                        this.physics.moveToObject(this.pet, this.player, 60);
                        this.pet.play('walk', true);
                        this.pet.setFlipX(this.pet.body!.velocity.x < 0);
                    } else {
                        // Wander or Interact based on room
                        const rnd = Phaser.Math.Between(0, 100);
                        if (rnd < 40) {
                            this.pet.setVelocity(0, 0);
                            this.pet.play('idle', true);
                            
                            // Contextual Dialogue
                            if (rnd < 15) {
                                if (this.currentRoom === 'Bedroom') this.showSpeech("💭 I'm sleepy...", 'weak');
                                else if (this.currentRoom === 'Kitchen') this.showSpeech("💭 Hungry!", 'excited');
                                else if (this.currentRoom === 'Park') this.showSpeech("💭 Let's play!!", 'happy');
                                else this.showSpeech("💭 I love you!", 'normal');
                            }
                        } else if (rnd < 70) {
                            const vx = Phaser.Math.Between(-40, 40);
                            const vy = Phaser.Math.Between(-40, 40);
                            this.pet.setVelocity(vx, vy);
                            this.pet.play('walk', true);
                            this.pet.setFlipX(vx < 0);
                        } else {
                            if (this.currentRoom === 'Bedroom') {
                                this.pet.setVelocity(0, 0);
                                this.pet.play('sleep', true);
                            } else {
                                this.pet.setVelocity(0, 0);
                                this.pet.play('idle', true);
                            }
                        }
                    }
                }

                update() {
                    // Player Movement
                    let vx = 0;
                    let vy = 0;
                    const speed = 100;

                    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
                    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

                    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
                    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

                    this.player.setVelocity(vx, vy);

                    if (vx !== 0 || vy !== 0) {
                        this.player.play('walk', true);
                        if (vx < 0) this.player.setFlipX(true);
                        else if (vx > 0) this.player.setFlipX(false);
                    } else {
                        this.player.play('idle', true);
                    }

                    // Lock UI elements to pet
                    this.stateText.setPosition(this.pet.x, this.pet.y + 20);
                    this.speechBubble.setPosition(this.pet.x, this.pet.y - 20);
                }
            }

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: gameRef.current!,
                physics: {
                    default: 'arcade',
                    arcade: { gravity: { x: 0, y: 0 }, debug: false }
                },
                scene: [BootScene, PlayScene],
                pixelArt: true,
                backgroundColor: '#111111'
            };

            game = new Phaser.Game(config);
        };

        initPhaser();

        return () => {
            if (game) {
                game.destroy(true);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl overflow-hidden border-4 border-indigo-900 shadow-xl mb-6">
            <div ref={gameRef} className="w-full max-w-[800px] aspect-[4/3] bg-black" style={{ imageRendering: 'pixelated' }}></div>
        </div>
    );
}
