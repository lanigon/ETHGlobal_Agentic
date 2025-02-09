import { Scene } from "phaser";
import { EventBus } from "../EventBus";

interface LoginResponse {
    success: boolean;
    data?: {
        userId: number;
        username: string;
        lastLoginTime: string;
    };
    error?: string;
}

export class loginScene extends Scene {
    private loginText: Phaser.GameObjects.Text;
    private connectButtonContainer: Phaser.GameObjects.DOMElement;

    constructor() {
        super("login");
    }

    preload() {
        // Load background image
        this.load.image("cover", "img/cover.png");
    }

    create() {
        // Get full screen size
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Add background image and set to cover full screen
        const background = this.add.image(width / 2, height / 2, "cover");

        // Set scale mode to cover entire screen while maintaining aspect ratio
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Set game canvas size to fullscreen
        this.scale.resize(width, height);

        // Enable fullscreen adaptation with background scaling
        this.scale.setGameSize(width, height);
        this.scale.on("resize", (gameSize: any) => {
            const w = gameSize.width;
            const h = gameSize.height;
            const newScaleX = w / background.width;
            const newScaleY = h / background.height;
            const newScale = Math.max(newScaleX, newScaleY);
            background.setScale(newScale);
            background.setPosition(w / 2, h / 2);
        });

        // Add title with elegant style
        const title = this.add
            .text(width / 2, height * 0.4, "Welcome to BEFORELIFE", {
                fontSize: "48px",
                color: "#ffffff",
                fontFamily: "Georgia, serif",
                stroke: "#000000",
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: "#000000",
                    blur: 2,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0.5);

        // Add title animation effect
        this.tweens.add({
            targets: title,
            scale: { from: 0.95, to: 1.05 },
            duration: 2000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        // Dynamically create ConnectButton container
        this.connectButtonContainer = this.add
            .dom(width / 2, height * 0.6)
            .createElement("div");

        // Create elegant button background
        const buttonWidth = 240;
        const buttonHeight = 60;
        const button = this.add.graphics();

        // Button background - solid color with rounded corners
        button.lineStyle(2, 0xffffff, 1);
        button.fillStyle(0x4a90e2, 1);
        button.fillRoundedRect(
            width / 2 - buttonWidth / 2,
            height * 0.6 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            15
        );
        button.strokeRoundedRect(
            width / 2 - buttonWidth / 2,
            height * 0.6 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            15
        );

        button
            .setInteractive(
                new Phaser.Geom.Rectangle(
                    width / 2 - buttonWidth / 2,
                    height * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight
                ),
                Phaser.Geom.Rectangle.Contains
            )
            .on("pointerover", () => {
                button.clear();
                button.lineStyle(2, 0xffffff, 1);
                button.fillStyle(0x357abd, 1);
                button.fillRoundedRect(
                    width / 2 - buttonWidth / 2,
                    height * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
                button.strokeRoundedRect(
                    width / 2 - buttonWidth / 2,
                    height * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
            })
            .on("pointerout", () => {
                button.clear();
                button.lineStyle(2, 0xffffff, 1);
                button.fillStyle(0x4a90e2, 1);
                button.fillRoundedRect(
                    width / 2 - buttonWidth / 2,
                    height * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
                button.strokeRoundedRect(
                    width / 2 - buttonWidth / 2,
                    height * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
            })
            .on("pointerdown", () => this.handleLogin());

        // Add button text with elegant style
        this.loginText = this.add
            .text(width / 2, height * 0.6, "Connect Wallet", {
                fontSize: "26px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: "#000000",
                    blur: 2,
                    fill: true,
                },
            })
            .setOrigin(0.5);

        // Listen for login response
        EventBus.on("phaser_loginResponse", (response: LoginResponse) => {
            if (response.success) {
                console.log("success:", response.data);
                // Store user info in game registry
                this.registry.set("userData", response.data);
                // Delay 1 second before transition to let user see success message
                this.time.delayedCall(1000, () => {
                    this.scene.start("Preloader");
                });
            } else {
                console.error("failed:", response.error);
                // Display error message
                this.add
                    .text(
                        width / 2,
                        height * 0.7,
                        `failed: ${response.error}`,
                        {
                            fontSize: "16px",
                            color: "#ff0000",
                        }
                    )
                    .setOrigin(0.5);
            }
        });
    }

    handleLogin() {
        // Show loading status
        this.loginText.setText("logging...");

        // Trigger login request
        EventBus.emit("phaser_loginRequest", {});

        // Add loading animation
        this.tweens.add({
            targets: this.loginText,
            alpha: 0.5,
            duration: 500,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });
    }
}
