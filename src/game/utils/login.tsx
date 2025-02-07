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
  const { data: userData, mutate: refreshUserData } = useGet<TestResponse>("/api/test?userId=1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loginHandler = async () => {
      try {
        setIsModalOpen(true);
      } catch (error) {
        console.error("打开钱包选择失败:", error);
      }
    };

    EventBus.on("phaser_loginRequest", loginHandler);

    return () => {
      EventBus.removeListener("phaser_loginRequest", loginHandler);
    };
  }, []);

  const handleGameStart = async () => {
    if (!window.ethereum) {
      console.error("❌ MetaMask 未安装！");
      alert("请安装 MetaMask！");
      return;
    }

    try {
      // 连接 MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setEthAddress(address);

      console.log("🎮 连接 Colyseus，钱包地址:", address);
      const room = await ColyseusClient.joinRoom(address);
      ColyseusClient.sendMessage("userLogin", { address });

      // ✅ 等待服务器的 `loginChallenge`
      const loginChallenge = await new Promise<{ challenge: string }>((resolve, reject) => {
        room.onMessage("loginChallenge", (data) => {
          if (data.challenge) {
            resolve(data);
          } else {
            reject(new Error("No challenge received"));
          }
        });

        setTimeout(() => reject(new Error("⏳ Challenge out of time")), 5000);
      });

      console.log("Challenge:", loginChallenge.challenge);

      // ✅ 使用 MetaMask 进行签名
      const signature = await signer.signMessage(loginChallenge.challenge);

      console.log("Signature:", signature);

      // ✅ 发送签名到后端
      ColyseusClient.sendMessage("loginSignature", {
        address,
        signature,
        challenge: loginChallenge.challenge,
      });

      // ✅ 等待后端返回登录状态
      const loginResponse = await new Promise<{ success: boolean; token?: string; reason?: string }>((resolve, reject) => {
        room.onMessage("loginResponse", (data) => {
          resolve(data);
        });

        setTimeout(() => reject(new Error("loginResponse timeout")), 5000);
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

        setIsModalOpen(false); // 关闭钱包选择弹窗
      } else {
        console.error("❌ 登录失败:", loginResponse.reason);
      }
    } catch (error) {
      console.error("❌ 进入游戏失败:", error);
    }
  };

  return (
    <>
      {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} onGameStart={handleGameStart} />}
    </>
  );
}