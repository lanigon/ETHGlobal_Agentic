"use client";

import { useEffect, useState } from "react";
import { EventBus } from "../EventBus";
import { useGet } from "@/hooks/useGet";
import { WalletModal } from "@/components/WalletModal";
import ColyseusClient from "@/game/utils/ColyseusClient";
import { ethers } from "ethers";

type TestResponse = {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    username: string;
    lastLoginTime: string;
  };
};

export function ReactPhaserBridge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loginHandler = async () => {
      try {
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to open wallet selector:", error);
      }
    };

    EventBus.on("phaser_loginRequest", loginHandler);

    return () => {
      EventBus.removeListener("phaser_loginRequest", loginHandler);
    };
  }, []);

  const handleGameStart = async () => {
    if (!window.ethereum) {
      console.error("❌ MetaMask not installed!");
      alert("Please install MetaMask!");
      return;
    }

    try {
      // Connect MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEthAddress(address);

      console.log("🎮 Connecting to Colyseus, wallet address:", address);
      const room = await ColyseusClient.joinRoom(address);
      ColyseusClient.sendMessage("userLogin", { address });

      // ✅ Wait for server's `loginChallenge`
      const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
        room.onMessage("loginChallenge", (data) => {
          if (data.challenge) {
            resolve(data);
          } else {
            reject(new Error("No challenge received"));
          }
        });

        setTimeout(() => reject(new Error("⏳ Challenge timeout")), 5000);
      });

      console.log("Challenge:", loginChallenge.challenge);

      // ✅ Sign with MetaMask
      const signature = await signer.signMessage(loginChallenge.challenge);

      console.log("Signature:", signature);

      // ✅ Send signature to backend
      ColyseusClient.sendMessage("loginSignature", {
        address,
        signature,
        challenge: loginChallenge.challenge,
      });

      // ✅ Wait for login response
      const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
        room.onMessage("loginResponse", (data) => {
          resolve(data);
        });

        setTimeout(() => reject(new Error("Login response timeout")), 5000);
      });

      console.log("loginResponse:", loginResponse);

      if (loginResponse.success) {
        EventBus.emit("phaser_loginResponse", {
          success: true,
          data: {
            walletName: "MetaMask",
            walletAddress: address,
            token: loginResponse.token, // JWT Token
          },
        });

        setIsModalOpen(false); // Close wallet selector modal
      } else {
        console.error("❌ Login failed:", loginResponse.reason);
      }
    } catch (error) {
      console.error("❌ Failed to enter game:", error);
    }
  };

  return (
    <>
      {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} onGameStart={handleGameStart} />}
    </>
  );
}