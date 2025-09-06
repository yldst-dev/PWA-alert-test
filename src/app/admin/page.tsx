'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Send, X } from "lucide-react";

interface SubscriptionInfo {
  id: string;
  createdAt: string;
  endpoint: string;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
  scheduledAt: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'cancelled';
  sentAt?: string;
}

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchScheduledNotifications();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/send-notification');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch {
      console.error('Failed to fetch subscriptions');
    }
  };

  const fetchScheduledNotifications = async () => {
    try {
      const response = await fetch('/api/schedule-notification');
      const data = await response.json();
      setScheduledNotifications(data.notifications || []);
    } catch {
      console.error('Failed to fetch scheduled notifications');
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: '제목과 내용을 입력해주세요.' });
      return;
    }

    if (sendType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      setMessage({ type: 'error', text: '예약 일시를 선택해주세요.' });
      return;
    }

    try {
      setLoading(true);
      
      if (sendType === 'immediate') {
        await sendImmediateNotification();
      } else {
        await scheduleNotification();
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const sendImmediateNotification = async () => {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        url: url || '/',
        sendToAll: true
      }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage({ 
        type: 'success', 
        text: `알림이 즉시 전송되었습니다! (성공: ${data.results.success}, 실패: ${data.results.failed})` 
      });
      resetForm();
    } else {
      setMessage({ type: 'error', text: data.error || '알림 전송에 실패했습니다.' });
    }
  };

  const scheduleNotification = async () => {
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    
    const response = await fetch('/api/schedule-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        url: url || '/',
        scheduledAt: scheduledAt.toISOString()
      }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage({ 
        type: 'success', 
        text: `알림이 ${new Date(data.scheduledAt).toLocaleString('ko-KR')}에 예약되었습니다!` 
      });
      resetForm();
      fetchScheduledNotifications();
    } else {
      setMessage({ type: 'error', text: data.error || '알림 예약에 실패했습니다.' });
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setUrl('/');
    setScheduledDate('');
    setScheduledTime('');
  };

  const handleCancelNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/schedule-notification?id=${notificationId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '예약된 알림이 취소되었습니다.' });
        fetchScheduledNotifications();
      } else {
        setMessage({ type: 'error', text: data.error || '알림 취소에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    }
  };

  const handleQuickSend = (quickTitle: string, quickBody: string) => {
    setTitle(quickTitle);
    setBody(quickBody);
  };

  // 현재 날짜와 시간을 기본값으로 설정
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = sendType === 'scheduled' && scheduledDate === minDate ? 
    now.toTimeString().slice(0, 5) : '00:00';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">푸시 알림 관리</h1>
          <p className="text-muted-foreground">
            구독자들에게 즉시 또는 예약으로 푸시 알림을 보내세요
          </p>
        </header>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>알림 작성</span>
                </CardTitle>
                <CardDescription>
                  알림을 작성하고 전송 방법을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="알림 제목을 입력하세요"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    {title.length}/100
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">내용</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="알림 내용을 입력하세요"
                    maxLength={300}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    {body.length}/300
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">클릭 시 이동할 URL (선택사항)</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/"
                  />
                </div>

                <div className="space-y-3">
                  <Label>전송 방법</Label>
                  <RadioGroup 
                    value={sendType} 
                    onValueChange={(value: 'immediate' | 'scheduled') => setSendType(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate" className="flex items-center space-x-2 cursor-pointer">
                        <Send className="h-4 w-4" />
                        <span>즉시 전송</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <Label htmlFor="scheduled" className="flex items-center space-x-2 cursor-pointer">
                        <Clock className="h-4 w-4" />
                        <span>예약 전송</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {sendType === 'scheduled' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="date">예약 날짜</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={minDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">예약 시간</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        min={minTime}
                      />
                    </div>
                    {scheduledDate && scheduledTime && (
                      <div className="sm:col-span-2 text-sm text-muted-foreground">
                        예약 시간: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('ko-KR')}
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleSendNotification}
                  disabled={loading || !title.trim() || !body.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? '처리 중...' : 
                   sendType === 'immediate' ? 
                   `즉시 전송 (${subscriptions.length}명)` : 
                   '예약 등록'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>빠른 전송</CardTitle>
                <CardDescription>
                  미리 준비된 알림 템플릿을 사용하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleQuickSend('환영합니다!', 'PWA 알림 테스트 앱에 오신 것을 환영합니다!')}
                  >
                    환영 메시지
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickSend('업데이트 알림', '새로운 기능이 추가되었습니다. 확인해보세요!')}
                  >
                    업데이트 알림
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickSend('테스트 알림', '이것은 테스트 알림입니다.')}
                  >
                    테스트 알림
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickSend('중요 공지', '중요한 공지사항이 있습니다. 확인해주세요.')}
                  >
                    중요 공지
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>구독자 현황</CardTitle>
                <CardDescription>
                  현재 등록된 구독자 정보
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {subscriptions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">총 구독자 수</p>
                </div>
                
                {subscriptions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">최근 구독자</h4>
                    {subscriptions.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{sub.id}</Badge>
                        <span className="text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>예약된 알림</span>
                </CardTitle>
                <CardDescription>
                  현재 예약된 알림 목록
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledNotifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    예약된 알림이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scheduledNotifications.map((notification) => (
                      <div key={notification.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge 
                                variant={
                                  notification.status === 'pending' ? 'default' :
                                  notification.status === 'sent' ? 'secondary' : 'destructive'
                                }
                              >
                                {notification.status === 'pending' ? '대기중' :
                                 notification.status === 'sent' ? '전송완료' : '취소됨'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.id.slice(-8)}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {notification.body}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              예약: {new Date(notification.scheduledAt).toLocaleString('ko-KR')}
                            </p>
                            {notification.sentAt && (
                              <p className="text-xs text-muted-foreground">
                                전송: {new Date(notification.sentAt).toLocaleString('ko-KR')}
                              </p>
                            )}
                          </div>
                          {notification.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사용 팁</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>즉시 전송:</strong> 모든 구독자에게 바로 알림을 보냅니다</p>
                <p>• <strong>예약 전송:</strong> 지정한 시간에 자동으로 알림을 보냅니다</p>
                <p>• 제목은 간결하고 명확하게 작성하세요</p>
                <p>• URL을 설정하면 알림 클릭 시 해당 페이지로 이동합니다</p>
                <p>• iOS에서는 PWA로 설치된 상태에서만 푸시 알림이 작동합니다</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}