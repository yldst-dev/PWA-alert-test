'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  requestNotificationPermission, 
  subscribeToPush,
  testLocalNotification 
} from '@/lib/push-notification';

export default function TestPage() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setMessage({ type: 'success', text: '알림 권한이 허용되었습니다!' });
      } else {
        setMessage({ type: 'error', text: '알림 권한이 거부되었습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '권한 요청 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeToPush = async () => {
    try {
      setLoading(true);
      console.log('Starting subscription process...');
      
      const subscription = await subscribeToPush();
      console.log('Got subscription:', subscription);
      
      if (subscription) {
        console.log('Sending subscription to server...');
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.subscriptionId) {
          setSubscriptionId(data.subscriptionId);
          setIsSubscribed(true);
          setMessage({ type: 'success', text: '푸시 알림 구독이 완료되었습니다!' });
        } else {
          setMessage({ type: 'error', text: data.error || '서버에서 구독 처리에 실패했습니다.' });
        }
      } else {
        setMessage({ type: 'error', text: '구독 객체를 생성할 수 없습니다.' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : '구독 중 알 수 없는 오류가 발생했습니다.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLocalNotification = async () => {
    try {
      await testLocalNotification('로컬 테스트', '이것은 로컬 알림 테스트입니다.');
      setMessage({ type: 'success', text: '로컬 알림이 전송되었습니다!' });
    } catch {
      setMessage({ type: 'error', text: '로컬 알림 전송에 실패했습니다.' });
    }
  };

  const handleTestPushNotification = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '푸시 테스트',
          body: '이것은 서버에서 보낸 푸시 알림입니다!',
          url: '/test'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '푸시 알림이 전송되었습니다!' });
      }
    } catch {
      setMessage({ type: 'error', text: '푸시 알림 전송에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionBadgeColor = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">PWA 알림 테스트</h1>
          <p className="text-muted-foreground">
            iOS PWA에서 푸시 알림을 테스트해보세요
          </p>
        </header>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                알림 권한 상태
                <Badge className={getPermissionBadgeColor(notificationPermission)}>
                  {notificationPermission}
                </Badge>
              </CardTitle>
              <CardDescription>
                푸시 알림을 받기 위해서는 먼저 알림 권한을 허용해야 합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRequestPermission}
                disabled={loading || notificationPermission === 'granted'}
                className="w-full"
              >
                {loading ? '처리 중...' : '알림 권한 요청'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                푸시 구독 상태
                <Badge variant={isSubscribed ? 'default' : 'outline'}>
                  {isSubscribed ? '구독됨' : '미구독'}
                </Badge>
              </CardTitle>
              <CardDescription>
                서버에서 푸시 알림을 받기 위해 구독합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSubscribeToPush}
                disabled={loading || notificationPermission !== 'granted' || isSubscribed}
                className="w-full"
              >
                {loading ? '처리 중...' : '푸시 알림 구독하기'}
              </Button>
              {subscriptionId && (
                <p className="text-sm text-muted-foreground mt-2">
                  구독 ID: {subscriptionId}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>알림 테스트</CardTitle>
              <CardDescription>
                다양한 방법으로 알림을 테스트해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleTestLocalNotification}
                disabled={notificationPermission !== 'granted'}
                className="w-full"
                variant="outline"
              >
                로컬 알림 테스트
              </Button>
              
              <Button 
                onClick={handleTestPushNotification}
                disabled={loading || !isSubscribed}
                className="w-full"
              >
                {loading ? '전송 중...' : '푸시 알림 테스트'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>사용법</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. 먼저 &quot;알림 권한 요청&quot; 버튼을 클릭하여 알림 권한을 허용하세요</p>
              <p>2. &quot;푸시 알림 구독하기&quot;를 클릭하여 서버에 구독 정보를 등록하세요</p>
              <p>3. &quot;로컬 알림 테스트&quot;로 브라우저 로컬 알림을 테스트하세요</p>
              <p>4. &quot;푸시 알림 테스트&quot;로 서버에서 보내는 푸시 알림을 테스트하세요</p>
              <p className="text-amber-600">
                ⚠️ iOS Safari에서는 홈 화면에 추가(PWA)한 후에만 푸시 알림이 작동합니다
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}