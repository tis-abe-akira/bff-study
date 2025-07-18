import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 認証が必要なパスかチェック
  const isProtectedPath = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/trainings');
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  try {
    // BFFの認証状態をチェック
    const authCheckUrl = new URL('/api/auth/status', 'http://localhost:8080');
    const authResponse = await fetch(authCheckUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      
      if (authData.authenticated) {
        // 認証済み - 通常のページ表示
        return NextResponse.next();
      }
    }
    
    // 未認証 - BFFのログインページにリダイレクト
    const loginUrl = new URL('/api/auth/login', 'http://localhost:8080');
    return NextResponse.redirect(loginUrl);
    
  } catch (error) {
    console.error('Auth check failed:', error);
    
    // エラー時もログインページにリダイレクト
    const loginUrl = new URL('/api/auth/login', 'http://localhost:8080');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trainings/:path*'
  ]
};