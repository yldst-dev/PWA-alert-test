import { NextRequest, NextResponse } from 'next/server';
import { 
  scheduleNotification,
  getAllScheduledNotifications,
  cancelScheduledNotification,
  type ScheduledNotification 
} from '@/lib/scheduled-notification-store';

export async function POST(request: NextRequest) {
  try {
    const { title, body, url, scheduledAt } = await request.json();
    
    if (!title || !body || !scheduledAt) {
      return NextResponse.json({ 
        error: 'Title, body, and scheduledAt are required' 
      }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return NextResponse.json({ 
        error: 'Scheduled time must be in the future' 
      }, { status: 400 });
    }

    const notificationId = scheduleNotification(title, body, scheduledDate, url);
    
    return NextResponse.json({
      success: true,
      notificationId,
      message: 'Notification scheduled successfully',
      scheduledAt: scheduledDate.toISOString()
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule notification' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const notifications = getAllScheduledNotifications();
    
    return NextResponse.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        url: notification.url,
        scheduledAt: notification.scheduledAt.toISOString(),
        createdAt: notification.createdAt.toISOString(),
        status: notification.status,
        sentAt: notification.sentAt?.toISOString()
      })),
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch scheduled notifications' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ 
        error: 'Notification ID is required' 
      }, { status: 400 });
    }

    const cancelled = cancelScheduledNotification(notificationId);
    
    if (!cancelled) {
      return NextResponse.json({ 
        error: 'Notification not found or already processed' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel notification' 
    }, { status: 500 });
  }
}