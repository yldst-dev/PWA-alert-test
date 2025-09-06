'use client';

import { useEffect } from 'react';

export default function SchedulerInitializer() {
  useEffect(() => {
    // 클라이언트에서는 스케줄러를 직접 시작하지 않습니다
    // 서버 사이드에서 자동으로 시작됩니다
    console.log('PWA Notification App initialized');
  }, []);

  return null;
}