"use client"

import { useEffect } from 'react';
import { EventBus } from '../EventBus';
import { useGet } from '@/hooks/useGet';

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
  useEffect(() => {
    // 监听 Phaser 发出的请求事件
    const handler = async (payload: { userId: number }) => {
      try {
        // 使用 mutate 来刷新数据，并传入 userId 参数
        const result = await refreshUserData()
          // 发送数据回 Phaser
        EventBus.emit('phaser_loginResponse', {
          success: true,
          data: result
        });
      } catch (error) {
        EventBus.emit('phaser_loginResponse', {
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    };

    EventBus.on('phaser_loginRequest', handler);

    return () => {
      EventBus.removeListener('phaser_loginRequest', handler);
    };
  }, [refreshUserData]);

  return null;
}
