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

    // Connect MetaMask
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

    // Disconnect wallet
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
                background: "rgba(0, 0, 0, 0.85)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                style={{
                    background: "rgba(20, 20, 20, 0.95)",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0, 255, 255, 0.7)",
                    textAlign: "center",
                    width: "400px",
                    border: "2px solid rgba(0, 255, 255, 0.5)",
                }}
            >
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        marginBottom: "15px",
                        color: "#0ff",
                        textShadow: "0 0 10px #0ff",
                    }}
                >
                    🔮 Select Wallet
                </h2>

                {/* Connect MetaMask Button */}
                <button
                    onClick={handleConnectMetaMask}
                    style={{
                        width: "100%",
                        padding: "12px",
                        border: ethAddress ? "2px solid #0f0" : "2px solid #ff0090",
                        backgroundColor: ethAddress ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 144, 0.2)",
                        color: ethAddress ? "#0f0" : "#ff0090",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        borderRadius: "8px",
                        textShadow: ethAddress ? "0 0 5px #0f0" : "0 0 5px #ff0090",
                        transition: "all 0.3s ease",
                        marginBottom: "10px",
                    }}
                >
                    {ethAddress ? `✅ Connected ${ethAddress.slice(0, 6)}...` : "Connect MetaMask"}
                </button>

                {/* Disconnect Button */}
                {ethAddress && (
                    <button
                        onClick={handleDisconnect}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px solid #ff4500",
                            backgroundColor: "rgba(255, 69, 0, 0.2)",
                            color: "#ff4500",
                            fontSize: "14px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textShadow: "0 0 5px #ff4500",
                            transition: "all 0.3s ease",
                        }}
                    >
                        ❌ Disconnect
                    </button>
                )}

                {/* Enter Game Button */}
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

                {/* Error Message */}
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