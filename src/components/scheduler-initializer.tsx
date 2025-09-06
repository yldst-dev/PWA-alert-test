'use client';

import { useEffect } from 'react';

export default function SchedulerInitializer() {
  useEffect(() => {
    console.log('PWA Notification App initialized');
    console.log('Scheduled notifications are now processed via API endpoints');
  }, []);

  return null;
}