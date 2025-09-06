export interface StoredSubscription {
  id: string;
  subscription: PushSubscriptionJSON;
  createdAt: Date;
}

// 간단한 메모리 저장소 (실제 운영에서는 데이터베이스 사용)
const subscriptions = new Map<string, StoredSubscription>();

export function saveSubscription(subscription: PushSubscriptionJSON): string {
  const id = Date.now().toString();
  subscriptions.set(id, {
    id,
    subscription,
    createdAt: new Date(),
  });
  return id;
}

export function getSubscription(id: string): StoredSubscription | undefined {
  return subscriptions.get(id);
}

export function getAllSubscriptions(): StoredSubscription[] {
  return Array.from(subscriptions.values());
}

export function removeSubscription(id: string): boolean {
  return subscriptions.delete(id);
}