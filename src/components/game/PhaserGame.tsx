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
                pet!: Phaser.Physics.Arcade.Sprite;
                stateText!: Phaser.GameObjects.Text;
                
                constructor() { super({ key: 'PlayScene' }); }

                create() {
                    // Generate Environment using our procedural tiles
                    for (let x = 0; x < 20; x++) {
                        for (let y = 0; y < 15; y++) {
                            this.add.image(x * 32, y * 32, 'tile_grass').setOrigin(0, 0);
                        }
                    }

                    // Create Pet Sprite
                    this.pet = this.physics.add.sprite(400, 300, 'pet_idle');
                    this.pet.setCollideWorldBounds(true);
                    
                    // Procedural Animations
                    this.anims.create({
                        key: 'idle',
                        frames: [ { key: 'pet_idle' } ],
                        frameRate: 2,
                        repeat: -1
                    });
                     this.anims.create({
                        key: 'walk',
                        frames: [ { key: 'pet_idle' }, { key: 'pet_walk' } ],
                        frameRate: 6,
                        repeat: -1
                    });
                    this.anims.create({
                        key: 'sleep',
                        frames: [ { key: 'pet_sleep' } ],
                        frameRate: 1,
                        repeat: -1
                    });

                    this.pet.play('idle');

                    // Name plate / State text
                    this.stateText = this.add.text(400, 270, 'Wandering', { 
                        fontFamily: 'monospace', 
                        fontSize: '12px', 
                        color: '#ffffff',
                        backgroundColor: '#00000088'
                    }).setOrigin(0.5);

                    // Camera follow
                    this.cameras.main.startFollow(this.pet, true, 0.05, 0.05);
                    this.cameras.main.setZoom(1.5);

                    // Autonomous Behavior Loop
                    this.time.addEvent({
                        delay: 2000,
                        callback: this.evaluateAIBehavior,
                        callbackScope: this,
                        loop: true
                    });
                }

                evaluateAIBehavior() {
                    const rnd = Phaser.Math.Between(0, 100);
                    
                    if (rnd < 30) {
                        // Idle
                        this.pet.setVelocity(0, 0);
                        this.pet.play('idle', true);
                        this.stateText.setText('Idle');
                    } else if (rnd < 40) {
                        // Sleep
                        this.pet.setVelocity(0, 0);
                        this.pet.play('sleep', true);
                        this.stateText.setText('Zzz...');
                    } else {
                        // Wander
                        const speed = 40;
                        const vx = Phaser.Math.Between(-speed, speed);
                        const vy = Phaser.Math.Between(-speed, speed);
                        this.pet.setVelocity(vx, vy);
                        
                        if (vx < 0) this.pet.setFlipX(true);
                        else if (vx > 0) this.pet.setFlipX(false);
                        
                        this.pet.play('walk', true);
                        this.stateText.setText('Walking');
                    }
                }

                update() {
                    // Lock text above pet
                    this.stateText.setPosition(this.pet.x, this.pet.y - 25);
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
