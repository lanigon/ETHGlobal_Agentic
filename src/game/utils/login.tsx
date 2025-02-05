"use client";

import { useEffect, useState } from 'react';
import { EventBus } from '../EventBus';
import { useGet } from '@/hooks/useGet';
import { WalletModal } from '@/components/WalletModal';
import { WalletProvider, useCurrentWallet } from '@mysten/dapp-kit';

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
  const { data: userData, mutate: refreshUserData } = useGet<TestResponse>('/api/test?userId=1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentWallet } = useCurrentWallet();

  useEffect(() => {
    const loginHandler = async () => {
      try {
        setIsModalOpen(true);
      } catch (error) {
        console.error("打开钱包选择失败:", error);
      }
    };

    EventBus.on('phaser_loginRequest', loginHandler);

    return () => {
      EventBus.removeListener('phaser_loginRequest', loginHandler);
    };
  }, []);

  const handleGameStart = () => {
    if (currentWallet) {
      EventBus.emit('phaser_loginResponse', {
        success: true,
        data: {
          walletName: currentWallet.name,
          walletAddress: currentWallet.accounts[0]?.address,
        },
      });
    }
  };

  return (
    <>
      {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} onGameStart={handleGameStart} />}
    </>
  );
}