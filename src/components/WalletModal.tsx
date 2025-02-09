import React, { useState } from "react";
import { ethers } from "ethers";

// 定义 Props 类型
interface WalletModalProps {
    onClose: () => void;
    onGameStart: (address: string) => void;
}

export function WalletModal({ onClose, onGameStart }: WalletModalProps) {
    const [ethAddress, setEthAddress] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    // 连接 MetaMask
    const handleConnectMetaMask = async () => {
        if (!window.ethereum) {
            setError("❌ Please install MetaMask!");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setEthAddress(address);
            console.log("✅ MetaMask connected, address:", address);
        } catch (err) {
            setError("❌ Failed to connect MetaMask!");
            console.error(err);
        }
    };

    // 断开连接
    const handleDisconnect = () => {
        setEthAddress(null);
        console.log("❌ MetaMask disconnected");
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "1000",
            }}
        >
            <div
                style={{
                    backgroundColor: "#1E1B2D",
                    padding: "24px",
                    borderRadius: "10px",
                    border: "2px solid #4EEAFF",
                    width: "300px",
                }}
            >
                <h2
                    style={{
                        color: "#4EEAFF",
                        textAlign: "center",
                        marginBottom: "20px",
                        textShadow: "0 0 10px #4EEAFF",
                    }}
                >
                    🔮 Select Wallet
                </h2>

                {/* 连接 MetaMask */}
                <button
                    onClick={handleConnectMetaMask}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "rgba(0, 255, 255, 0.1)",
                        color: "#0ff",
                        border: "2px solid #0ff",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        textShadow: "0 0 8px #0ff",
                        transition: "all 0.3s ease",
                    }}
                >
                    {ethAddress ? `✅ Connected ${ethAddress.slice(0, 6)}...` : "Connect MetaMask"}
                </button>

                {/* 断开连接按钮 */}
                {ethAddress && (
                    <button
                        onClick={handleDisconnect}
                        style={{
                            marginTop: "10px",
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            color: "#ff4444",
                            border: "2px solid #ff4444",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textShadow: "0 0 8px #ff4444",
                            transition: "all 0.3s ease",
                        }}
                    >
                        ❌ Disconnect
                    </button>
                )}

                {/* 进入游戏按钮 */}
                <button
                    onClick={() => {
                        if (ethAddress) {
                            onGameStart(ethAddress);
                            onClose();
                        }
                    }}
                    disabled={!ethAddress}
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        padding: "12px",
                        backgroundColor: ethAddress ? "rgba(0, 255, 255, 0.5)" : "rgba(128, 128, 128, 0.5)",
                        color: ethAddress ? "#0ff" : "#888",
                        border: "2px solid #0ff",
                        borderRadius: "5px",
                        cursor: ethAddress ? "pointer" : "not-allowed",
                        fontSize: "16px",
                        fontWeight: "bold",
                        textShadow: "0 0 8px #0ff",
                        transition: "all 0.3s ease",
                    }}
                >
                    🎮 Enter Game
                </button>

                {/* 错误信息 */}
                {error && (
                    <p
                        style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "10px",
                            textShadow: "0 0 5px red",
                        }}
                    >
                        ⚠️ {error}
                    </p>
                )}
            </div>
        </div>
    );
}