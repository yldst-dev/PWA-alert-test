export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    console.log('Starting push subscription process...');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push messaging is not supported');
      throw new Error('Push messaging is not supported');
    }

    console.log('Waiting for service worker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('Service worker is ready:', registration);
    
    // 이미 구독되어 있는지 확인
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed:', existingSubscription);
      return existingSubscription;
    }

    // VAPID 키 (실제 운영에서는 환경변수로 관리)
    const publicVapidKey = 'BLHkFowNUf1a1eRTAmYPsBXaQnJOSoUmUdwqYVl0dOVXPvhKlLhZi2OJpT3x5rFdp9LGO1br8IO7t5s27AwJDT4';
    
    console.log('Subscribing to push notifications...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    } as unknown as PushSubscriptionOptions);

    console.log('Successfully subscribed:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
    }),
  });
}

export async function testLocalNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  } else {
    throw new Error('Notification permission not granted');
  }
}