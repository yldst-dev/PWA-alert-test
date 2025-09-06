import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import { Bell, Settings, TestTube } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PWAInstallPrompt />
        
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            📱 PWA 알림 테스트
          </h1>
          <p className="text-xl text-muted-foreground">
            iOS PWA에서 푸시 알림을 테스트하고 관리하는 애플리케이션
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-blue-500" />
                <span>알림 테스트</span>
              </CardTitle>
              <CardDescription>
                푸시 알림 권한 설정부터 테스트까지 한 번에
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                알림 권한 요청, 푸시 구독, 로컬 알림 및 서버 푸시 알림을 테스트할 수 있습니다.
              </p>
              <Button asChild className="w-full">
                <Link href="/test">알림 테스트 시작하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-500" />
                <span>알림 관리</span>
              </CardTitle>
              <CardDescription>
                커스텀 알림을 작성하고 구독자들에게 전송
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                모든 구독자에게 커스텀 푸시 알림을 보내고 구독자 현황을 확인할 수 있습니다.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">관리자 페이지</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <span>사용 방법</span>
            </CardTitle>
            <CardDescription>
              iOS PWA에서 푸시 알림을 받는 방법
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">📱 iOS에서 설치하기</h3>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Safari에서 이 웹사이트를 열어주세요</li>
                  <li>공유 버튼(📤)을 탭하세요</li>
                  <li>&quot;홈 화면에 추가&quot;를 선택하세요</li>
                  <li>&quot;추가&quot; 버튼을 탭하여 설치를 완료하세요</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-green-600">🔔 알림 테스트하기</h3>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>홈 화면에서 설치된 앱을 실행하세요</li>
                  <li>&quot;알림 테스트&quot; 페이지로 이동하세요</li>
                  <li>알림 권한을 허용하고 구독하세요</li>
                  <li>로컬 알림과 푸시 알림을 테스트하세요</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ 중요 사항</h4>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>iOS에서는 반드시 홈 화면에 추가(PWA 설치) 후에만 푸시 알림이 작동합니다</li>
                <li>Safari 브라우저에서는 푸시 알림이 작동하지 않습니다</li>
                <li>알림 권한을 거부하면 설정에서 직접 변경해야 합니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>기술 스택</CardTitle>
            <CardDescription>
              이 애플리케이션에 사용된 기술들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-sm">Next.js 15</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">TypeScript</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-sm">Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm">shadcn/ui</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">PWA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Push API</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Service Worker</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Web Push</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
