import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { 
  getPendingNotifications, 
  markNotificationAsSent,
  type ScheduledNotification 
} from '@/lib/scheduled-notification-store';
import { getAllSubscriptions } from '@/lib/subscription-store';

// VAPID 키 설정 (실제 운영에서는 환경변수로 관리)
const vapidKeys = {
  publicKey: 'BLHkFowNUf1a1eRTAmYPsBXaQnJOSoUmUdwqYVl0dOVXPvhKlLhZi2OJpT3x5rFdp9LGO1br8IO7t5s27AwJDT4',
  privateKey: 'GnpR7ApvVNdAOcXpSo2rCa83ggMGP2oi4R8O_-7Osjw'
};

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST() {
  try {
    console.log('Processing scheduled notifications...');
    
    const pendingNotifications = getPendingNotifications();
    console.log(`Found ${pendingNotifications.length} pending notifications`);
    
    if (pendingNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending notifications to process',
        processed: 0
      });
    }

    const results = [];
    
    for (const notification of pendingNotifications) {
      try {
        const result = await processScheduledNotification(notification);
        results.push(result);
        console.log(`Processed notification ${notification.id}:`, result);
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        results.push({
          notificationId: notification.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingNotifications.length} scheduled notifications`,
      results: {
        total: pendingNotifications.length,
        success: successCount,
        failed: failCount
      },
      details: results
    });
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process scheduled notifications' 
    }, { status: 500 });
  }
}

async function processScheduledNotification(notification: ScheduledNotification) {
  try {
    const subscriptions = getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      console.log(`No subscriptions available for notification ${notification.id}`);
      markNotificationAsSent(notification.id);
      return {
        notificationId: notification.id,
        success: true,
        message: 'No subscribers, marked as sent',
        subscribers: 0
      };
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      timestamp: Date.now()
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload);
        return { success: true, subscriptionId: sub.id };
      } catch (error) {
        console.error('Failed to send to subscription:', sub.id, error);
        return { 
          success: false, 
          subscriptionId: sub.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const sendResults = await Promise.all(promises);
    const successCount = sendResults.filter(r => r.success).length;

    console.log(`Notification ${notification.id} sent to ${successCount}/${subscriptions.length} subscribers`);
    
    // 전송 완료로 표시
    markNotificationAsSent(notification.id);

    return {
      notificationId: notification.id,
      success: true,
      message: `Sent to ${successCount}/${subscriptions.length} subscribers`,
      subscribers: subscriptions.length,
      successCount,
      sendResults
    };
  } catch (error) {
    console.error(`Error sending notification ${notification.id}:`, error);
    return {
      notificationId: notification.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// GET 요청으로 현재 대기중인 알림 조회
export async function GET() {
  try {
    const pendingNotifications = getPendingNotifications();
    
    return NextResponse.json({
      success: true,
      pendingCount: pendingNotifications.length,
      notifications: pendingNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        scheduledAt: n.scheduledAt,
        status: n.status
      }))
    });
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get pending notifications' 
    }, { status: 500 });
  }
}