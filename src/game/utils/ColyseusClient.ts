import { Client, Room } from "colyseus.js";

const COLYSEUS_SERVER = "ws://47.236.128.7:2567";
//const COLYSEUS_SERVER = "ws://localhost:2567";

export interface Story {
    id: number;
    author_address: string;
    title: string;
    story_content: string;
    created_at: Date;
}

class ColyseusClient {
    private static instance: ColyseusClient;
    private client: Client;
    private room: Room | null = null;

    private constructor() {
        this.client = new Client(COLYSEUS_SERVER);
    }

    public static getInstance(): ColyseusClient {
        if (!ColyseusClient.instance) {
            ColyseusClient.instance = new ColyseusClient();
        }
        return ColyseusClient.instance;
    }

    public async joinRoom(walletAddress: string): Promise<Room> {
        if (this.room) {
            console.warn("⚠️ 已经连接到房间:", this.room.id);
            return this.room;
        }

        try {
            console.log("🎮 正在连接 Colyseus 服务器...");
            this.room = await this.client.joinOrCreate("tavern_room", {
                walletAddress,
            });
            console.log(`✅ 成功加入房间: ${this.room.id}, sessionId: ${this.room.sessionId}`);
            return this.room;
        } catch (error) {
            console.error("❌ 连接 Colyseus 失败:", error);
            throw error;
        }
    }

    // Story-related methods
    public async getAllStories(): Promise<Story[]> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法获取故事");
            return [];
        }

        try {
            this.sendMessage("fetchStory", {});
            console.log("📜 正在获取所有故事...");

            const response = await new Promise<{ success: boolean; story: Story; reason?: string }>((resolve) => {
                this.onMessage("fetchStoriesResult", (data) => {
                    resolve(data);
                    console.log("📜 收到故事列表:", data);
                });
            });

            if (response.success && response.story) {
                return [response.story];
            }
            return [];
        } catch (error) {
            console.error("❌ 获取故事失败:", error);
            return [];
        }
    }

    public async getMyStories(): Promise<Story[]> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法获取故事");
            return [];
        }

        try {
            this.sendMessage("getAllStory", {});
            console.log("�� 正在获取我的故事列表...");

            const response = await new Promise<{ success: boolean; stories: Story[]; reason?: string }>((resolve) => {
                this.onMessage("getAllStoryResponse", (data) => {
                    resolve(data);
                    console.log("📜 我的故事列表:", data);
                });
            });

            if (response.success && response.stories) {
                return response.stories;
            }
            return [];
        } catch (error) {
            console.error("❌ 获取我的故事失败:", error);
            return [];
        }
    }

    public async createStory(title: string, content: string): Promise<boolean> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法创建故事");
            return false;
        }

        try {
            // Validate content length (minimum 50 characters)
            // if (!content || content.length < 50) {
            //     console.error("❌ 故事内容至少需要50个字符");
            //     return false;
            // }

            this.sendMessage("publishStory", {
                title: title,
                storyText: content
            });
            console.log("📝 正在创建新故事...");

            const response = await new Promise<{ success: boolean; story: any; reason?: string }>((resolve) => {
                this.onMessage("storyPublishedResponse", (data) => {
                    resolve(data);
                    console.log("📜 故事创建结果:", data);
                });
            });

            if (response.success) {
                setTimeout(async () => {
                    const myStories = await this.getMyStories();
                    console.log("📚 发布后的故事列表:", myStories);
                }, 1000);
                return true;
            } else {
                console.error("❌ 创建故事失败:", response.reason);
                return false;
            }
        } catch (error) {
            console.error("❌ 创建故事失败:", error);
            return false;
        }
    }

    public async replyToStory(storyId: number, content: string): Promise<boolean> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法回复故事");
            return false;
        }

        try {
            this.sendMessage("replyStory", { storyId, content });
            console.log("💬 正在发送回复...");
            return true;
        } catch (error) {
            console.error("❌ 回复故事失败:", error);
            return false;
        }
    }

    public sendMessage(action: string, data: any) {
        if (this.room) {
            console.log("sendMessage:", action, data);
            this.room.send(action, data);
        } else {
            console.error("⚠️ 尚未加入房间，无法发送消息");
        }
    }

    public onMessage(action: string, callback: (data: any) => void) {
        if (this.room) {
            this.room.onMessage(action, callback);
        } else {
            console.error("⚠️ 尚未加入房间，无法监听消息");
        }
    }

    public leaveRoom() {
        if (this.room) {
            console.log(`❌ 断开 Colyseus 连接: ${this.room.id}`);
            this.room.leave();
            this.room = null;
        }
    }
}

export default ColyseusClient.getInstance();