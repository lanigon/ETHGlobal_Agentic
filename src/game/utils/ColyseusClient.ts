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

export interface Reply {
    id: number;
    story_id: number;
    parent_reply_id: number;
    author_address: string;
    reply_content: string;
    created_at: Date;
}

interface ReplyGroup {
    address: string;
    replies: Reply[];
}

class ColyseusClient {
    private static instance: ColyseusClient;
    private client: Client;
    public room: Room | null = null;

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
            
            // Add connection state listener
            this.room.onStateChange((state) => {
                console.log("Room state changed:", state);
            });

            this.room.onLeave((code) => {
                console.log("Left room with code:", code);
                this.room = null;
            });

            this.room.onError((code, message) => {
                console.error("Room error:", code, message);
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
            this.sendMessage("getRecvStories", {});
            console.log("📜 正在获取所有故事...");

            const response = await new Promise<{ success: boolean; recvStories: Story[]; reason?: string }>((resolve) => {
                this.onMessage("getRecvStoriesResponse", (data) => {
                    resolve(data);
                    console.log("📜 收到故事列表:", data);
                });
            });

            if (response.success && response.recvStories) {
                return response.recvStories;
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
            console.log("正在获取我的故事列表...");

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
            console.log("Current room sessionId:", this.room.sessionId);

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
            // Log the message being sent
            console.log("Sending reply:", {
                storyId: storyId.toString(),
                replyText: content
            });

            this.sendMessage("replyStory", { 
                storyId: storyId.toString(),
                replyText: content
            });

            const response = await new Promise<{ success: boolean; reason?: string }>((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error("Reply timeout after 5s"));
                }, 5000);

                this.room?.onMessage("replyStoryResponse", (data) => {
                    clearTimeout(timeoutId);
                    console.log("Received reply response:", data);
                    resolve(data);
                });
            });

            if (response.success) {
                // Refresh replies after successful reply
                await this.getRepliesForStory(storyId);
                return true;
            } else {
                console.error("Reply failed:", response.reason);
                return false;
            }
        } catch (error) {
            console.error("❌ Reply error:", error);
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

    public async getRepliesForStory(storyId: number): Promise<{ [key: string]: Reply[] }> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法获取回复");
            return {};
        }

        try {
            this.sendMessage("getRepliesByStoryId", {
                storyId: storyId.toString()
            });
            console.log("💬 正在获取故事回复...");

            const response = await new Promise<{ success: boolean; replies: { [key: string]: Reply[] }; reason?: string }>((resolve) => {
                this.onMessage("getRepliesResponse", (data) => {
                    resolve(data);
                    console.log("💬 收到回复列表:", data);
                });
            });

            if (response.success && response.replies) {
                return response.replies;
            }
            return {};
        } catch (error) {
            console.error("❌ 获取回复失败:", error);
            return {};
        }
    }

    public async sendWhiskey(storyId: number): Promise<boolean> {
        if (!this.room) {
            console.error("⚠️ 尚未加入房间，无法发送Whiskey");
            return false;
        }

        try {
            this.sendMessage("sendWhiskey", { 
                storyId: storyId.toString()
            });
            console.log("🥃 正在发送Whiskey...");

            const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
                this.onMessage("whiskeySent", (data) => {
                    resolve(data);
                    console.log("🥃 发送Whiskey结果:", data);
                });
            });

            return response.success;
        } catch (error) {
            console.error("❌ 发送Whiskey失败:", error);
            return false;
        }
    }
}

export default ColyseusClient.getInstance();