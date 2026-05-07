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

            class MainScene extends Phaser.Scene {
                petSprite!: Phaser.GameObjects.Rectangle; // Placeholder for actual pixel art sprite
                
                constructor() {
                    super({ key: 'MainScene' });
                }

                preload() {
                    // Load actual pixel art assets here
                    // this.load.spritesheet('pet_idle', '/assets/pet_idle.png', { frameWidth: 32, frameHeight: 32 });
                }

                create() {
                    // Create World
                    this.cameras.main.setBackgroundColor('#4a5e37'); // Cozy green ground
                    
                    // Temporary Pet Rect until sprites are loaded
                    this.petSprite = this.add.rectangle(400, 300, 32, 32, 0xffffff);
                    this.physics.add.existing(this.petSprite);
                    
                    // Simulated wandering behavior
                    this.time.addEvent({
                        delay: 3000,
                        callback: () => {
                            if (this.petSprite.body) {
                                const body = this.petSprite.body as Phaser.Physics.Arcade.Body;
                                body.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
                            }
                        },
                        loop: true
                    });
                }
            }

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: gameRef.current!,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false
                    }
                },
                scene: [MainScene],
                pixelArt: true, // Crucial for Stardew/Retro feel
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
        <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl mb-6">
            {/* Phaser Canvas injects here */}
            <div ref={gameRef} className="w-full max-w-[800px] aspect-[4/3] bg-black"></div>
        </div>
    );
}
