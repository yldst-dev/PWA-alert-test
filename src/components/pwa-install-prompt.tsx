'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS 감지
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // 이미 설치되었는지 확인
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS에서는 자동으로 프롬프트 표시
    if (iOS && !standalone) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // 이미 설치되었거나 숨김 처리된 경우 표시하지 않음
  if (isStandalone || !showPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-blue-900">
              📱 홈 화면에 추가하기
            </CardTitle>
            <CardDescription className="text-blue-700">
              더 나은 경험을 위해 앱으로 설치하세요
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-blue-800">
              iOS에서 PWA를 설치하려면:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Safari에서 공유 버튼 📤을 탭하세요</li>
              <li>&quot;홈 화면에 추가&quot; 옵션을 선택하세요</li>
              <li>&quot;추가&quot; 버튼을 탭하여 설치를 완료하세요</li>
            </ol>
            <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 홈 화면에 추가한 후에만 푸시 알림을 받을 수 있습니다!
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Button onClick={handleInstallClick} className="bg-blue-600 hover:bg-blue-700">
              지금 설치하기
            </Button>
            <p className="text-sm text-blue-700">
              빠른 접근과 푸시 알림을 위해 설치하세요
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}