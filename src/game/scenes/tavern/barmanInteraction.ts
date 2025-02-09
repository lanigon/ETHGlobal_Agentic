// scenes/tavern/BarmanInteraction.ts
import Phaser from "phaser";
import Player from "../../heroes/player";
import Barman from "../../heroes/barman";
import Dialog from "../../menu/dialog";
import { ChatWindow } from "../../menu/chatWindow";
import AIChatClient from "../../utils/AIChatClient";
import { EventBus } from "../../EventBus";

export class BarmanInteraction {
    private scene: Phaser.Scene;
    private player: Player;
    private barman: Barman;
    private gridSize: number;
    private dialog: Dialog;
    private chatWindow: ChatWindow;
    private isDialogVisible = false;

    constructor(
        scene: Phaser.Scene,
        player: Player,
        barman: Barman,
        gridSize: number
    ) {
        this.scene = scene;
        this.player = player;
        this.barman = barman;
        this.gridSize = gridSize;
        this.chatWindow = new ChatWindow((message) =>
            this.handleBarmanResponse(message)
        );

        // Add streaming response handler
        EventBus.on(
            "chat-stream",
            (data: { chunk: string; isComplete: boolean }) => {
                console.log("📨 Received stream chunk:", data);
                this.chatWindow.appendStreamingMessage(
                    data.chunk,
                    data.isComplete
                );
            }
        );
    }

    public handleBarmanInteraction() {
        const distance = Phaser.Math.Distance.Between(
            this.player.sprite.x,
            this.player.sprite.y,
            this.barman.sprite.x,
            this.barman.sprite.y
        );
        const maxDistance = this.gridSize * 5;

        if (distance <= maxDistance) {
            if (this.isDialogVisible) return;
            this.isDialogVisible = true;

            this.dialog = new Dialog(this.scene);
            const dialogs = [
                { text: "欢迎光临！需要什么帮助吗？" },
                {
                    text: "这里是我们镇上最好的酒馆。请选择一个选项：",
                    options: [
                        { text: "Chat", callback: () => this.startChat() },
                        { text: "Leave", callback: () => this.endDialog() },
                    ],
                },
            ];
            this.dialog.showDialogs(dialogs);
        } else {
            console.log("你离 Barman 太远了。");
        }
    }

    private startChat() {
        this.endDialog();
        this.chatWindow.show();
        // Initial greeting message in English
        this.chatWindow.addMessage(
            "Welcome to Web3 Tavern! I'm the bartender here, how can I help you today?",
            "barman"
        );
    }

    private handleBarmanResponse(userMessage: string) {
        console.log("💬 User message:", userMessage);
        // Show user message immediately without animation
        this.chatWindow.addMessage(userMessage, "user");

        // Use AIChatClient for AI response
        AIChatClient.sendMessage(userMessage).catch((error) => {
            console.error("Failed to get AI response:", error);
        });
    }

    private endDialog() {
        this.isDialogVisible = false;
        if (this.dialog && "destroy" in this.dialog) {
            this.dialog.destroy();
        }
    }

    public destroy() {
        this.chatWindow.destroy();
        this.dialog?.destroy();
        // Remove event listener
        EventBus.removeListener("chat-stream");
    }

    public isContained(x: number, y: number): boolean {
        return this.dialog?.isContained(x, y) || false;
    }
}
