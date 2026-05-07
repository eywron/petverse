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
                    };

                    // Procedural Pet Frames (Idle)
                    const petIdle1 = [
                        "  OOOO  ",
                        " OLLLLO ",
                        " OWWLLO ",
                        "OWOOWLOO",
                        "OWOOWLOO",
                        "OLLLLLLO",
                        " OLLLLO ",
                        "  OOOO  ",
                    ];
                    makeFrame('pet_idle', petIdle1, pal);

                    const petWalk = [
                        "  OOOO  ",
                        " OLLLLO ",
                        " OWWLLO ",
                        "OWOOWLOO",
                        "OWOOWLOO",
                        "OLLLLLLO",
                        " OLLLLO ",
                        "  O  O  ", // legs apart
                    ];
                    makeFrame('pet_walk', petWalk, pal);
                    
                    const petSleep = [
                        "        ",
                        "        ",
                        "  OOOO  ",
                        " OLLLLO ",
                        " O----O ",
                        "OLLLLLLO",
                        " OLLLLO ",
                        "  OOOO  ",
                    ];
                    makeFrame('pet_sleep', petSleep, pal);

                    // Floor Tile
                    const grassTile = [
                        "GGGGGGGG",
                        "GGDGGGGG",
                        "GGGGGGGD",
                        "DGGGGGGG",
                        "GGGGGGGG",
                        "GGGDGGGG",
                        "GGGGGGGG",
                        "GGDGGGGG",
                    ];
                    makeFrame('tile_grass', grassTile, pal);
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

                constructor() { super({ key: 'PlayScene' }); }

                create() {
                    // Controls
                    if (this.input.keyboard) {
                        this.cursors = this.input.keyboard.createCursorKeys();
                        this.wasd = {
                            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                        };
                    }

                    this.drawRoom('Bedroom');

                    // Player Avatar
                    this.player = this.physics.add.sprite(400, 300, 'pet_idle').setTint(0x8888ff); // Distinguish player
                    this.player.setCollideWorldBounds(true);

                    // Pet Avatar
                    this.pet = this.physics.add.sprite(450, 300, 'pet_idle');
                    this.pet.setCollideWorldBounds(true);
                    
                    // Procedural Animations
                    if (!this.anims.exists('idle')) {
                        this.anims.create({ key: 'idle', frames: [ { key: 'pet_idle' } ], frameRate: 2, repeat: -1 });
                        this.anims.create({ key: 'walk', frames: [ { key: 'pet_idle' }, { key: 'pet_walk' } ], frameRate: 6, repeat: -1 });
                        this.anims.create({ key: 'sleep', frames: [ { key: 'pet_sleep' } ], frameRate: 1, repeat: -1 });
                    }

                    this.player.play('idle');
                    this.pet.play('idle');

                    // Name plates
                    this.stateText = this.add.text(0, 0, 'Pet', { 
                        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', backgroundColor: '#000000aa'
                    }).setOrigin(0.5);

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

                drawRoom(roomName: string) {
                    this.currentRoom = roomName;
                    // Simple bounds for small rooms
                    this.physics.world.setBounds(0, 0, 800, 600);
                    
                    // Generate Environment based on room
                    const tint = roomName === 'Park' ? 0xffffff : (roomName === 'Bedroom' ? 0xddddff : 0xddffdd);
                    for (let x = 0; x < 25; x++) {
                        for (let y = 0; y < 19; y++) {
                            this.add.image(x * 32, y * 32, 'tile_grass').setOrigin(0, 0).setTint(tint);
                        }
                    }
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

                showSpeech(text: string) {
                    this.speechText.setText(text);
                    this.tweens.add({
                        targets: this.speechBubble,
                        alpha: 1, y: -40, duration: 200, ease: 'Bounce.Out',
                        onComplete: () => {
                            this.time.delayedCall(3000, () => {
                                this.tweens.add({ targets: this.speechBubble, alpha: 0, duration: 300 });
                            });
                        }
                    });
                }

                evaluateAIBehavior() {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pet.x, this.pet.y);
                    
                    // If far away, follow player
                    if (dist > 100) {
                        this.physics.moveToObject(this.pet, this.player, 60);
                        this.pet.play('walk', true);
                        this.pet.setFlipX(this.pet.body!.velocity.x < 0);
                    } else {
                        // Wander or Idle
                        const rnd = Phaser.Math.Between(0, 100);
                        if (rnd < 40) {
                            this.pet.setVelocity(0, 0);
                            this.pet.play('idle', true);
                            if (rnd < 10) this.showSpeech("💭 I love you!");
                        } else if (rnd < 80) {
                            const vx = Phaser.Math.Between(-30, 30);
                            const vy = Phaser.Math.Between(-30, 30);
                            this.pet.setVelocity(vx, vy);
                            this.pet.play('walk', true);
                            this.pet.setFlipX(vx < 0);
                        } else {
                            this.pet.setVelocity(0, 0);
                            this.pet.play('sleep', true);
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
