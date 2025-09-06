export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
  scheduledAt: Date;
  createdAt: Date;
  status: 'pending' | 'sent' | 'cancelled';
  sentAt?: Date;
}

// 간단한 메모리 저장소 (실제 운영에서는 데이터베이스 사용)
const scheduledNotifications = new Map<string, ScheduledNotification>();

export function scheduleNotification(
  title: string,
  body: string,
  scheduledAt: Date,
  url?: string
): string {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const notification: ScheduledNotification = {
    id,
    title,
    body,
    url,
    scheduledAt,
    createdAt: new Date(),
    status: 'pending',
  };

  scheduledNotifications.set(id, notification);
  return id;
}

export function getScheduledNotification(id: string): ScheduledNotification | undefined {
  return scheduledNotifications.get(id);
}

export function getAllScheduledNotifications(): ScheduledNotification[] {
  return Array.from(scheduledNotifications.values())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function getPendingNotifications(): ScheduledNotification[] {
  const now = new Date();
  return Array.from(scheduledNotifications.values())
    .filter(notification => 
      notification.status === 'pending' && 
      notification.scheduledAt <= now
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function markNotificationAsSent(id: string): boolean {
  const notification = scheduledNotifications.get(id);
  if (notification) {
    notification.status = 'sent';
    notification.sentAt = new Date();
    return true;
  }
  return false;
}

export function cancelScheduledNotification(id: string): boolean {
  const notification = scheduledNotifications.get(id);
  if (notification && notification.status === 'pending') {
    notification.status = 'cancelled';
    return true;
  }
  return false;
}

export function removeScheduledNotification(id: string): boolean {
  return scheduledNotifications.delete(id);
}