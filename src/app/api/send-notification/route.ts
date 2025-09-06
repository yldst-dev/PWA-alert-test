import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
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

export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();
    
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const subscriptions = getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription as webpush.PushSubscription, payload);
        return { success: true, subscriptionId: sub.id };
      } catch (error) {
        console.error('Failed to send notification to subscription:', sub.id, error);
        return { success: false, subscriptionId: sub.id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Notifications sent`,
      results: {
        total: subscriptions.length,
        success: successCount,
        failed: failCount
      },
      details: results
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}

export async function GET() {
  const subscriptions = getAllSubscriptions();
  return NextResponse.json({
    message: 'Push notification sending endpoint',
    methods: ['POST'],
    totalSubscriptions: subscriptions.length,
    subscriptions: subscriptions.map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      endpoint: s.subscription.endpoint?.substring(0, 50) + '...'
    }))
  });
}