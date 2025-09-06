import webpush from 'web-push';
import { 
  getPendingNotifications, 
  markNotificationAsSent,
  type ScheduledNotification 
} from './scheduled-notification-store';
import { getAllSubscriptions } from './subscription-store';

// VAPID 키 설정 (실제 운영에서는 환경변수로 관리)
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YxxaOBTjSW5iS-3UG6oZO7i7a_-8NWN2EKQa1oOTUE0ZxeqnVXU7_Ic',
  privateKey: 'YGd8mXzrE0SzMZJGvVfF0Hp5iyGtPV3c8UqXBj7zquc'
};

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (schedulerInterval) {
    return;
  }

  console.log('Starting notification scheduler...');
  
  // 1분마다 확인
  schedulerInterval = setInterval(async () => {
    await processScheduledNotifications();
  }, 60000); // 60초

  // 즉시 한 번 실행
  processScheduledNotifications();
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Notification scheduler stopped');
  }
}

async function processScheduledNotifications() {
  try {
    const pendingNotifications = getPendingNotifications();
    
    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(`Processing ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      await sendScheduledNotification(notification);
    }
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
}

async function sendScheduledNotification(notification: ScheduledNotification) {
  try {
    const subscriptions = getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      console.log(`No subscriptions available for notification ${notification.id}`);
      markNotificationAsSent(notification.id);
      return;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload);
        return { success: true, subscriptionId: sub.id };
      } catch (error) {
        console.error('Failed to send scheduled notification to subscription:', sub.id, error);
        return { 
          success: false, 
          subscriptionId: sub.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Scheduled notification ${notification.id} sent to ${successCount}/${subscriptions.length} subscribers`);
    
    markNotificationAsSent(notification.id);
  } catch (error) {
    console.error(`Error sending scheduled notification ${notification.id}:`, error);
  }
}

// 서버 시작 시 스케줄러 시작
if (typeof window === 'undefined') { // 서버 사이드에서만 실행
  startScheduler();
}