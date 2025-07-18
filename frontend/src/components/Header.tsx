'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, subtitle, showBackButton = false, backHref = '/dashboard' }: HeaderProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      // 1. ローカルストレージとセッションストレージをクリア
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. 手動でCookieを削除
      document.cookie.split(";").forEach(function(c) {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      // 3. BFFのログアウトエンドポイントに移動
      window.location.href = 'http://localhost:8080/api/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      // エラーでも強制的にログアウト
      window.location.href = 'http://localhost:8080/api/auth/logout';
    }
  };

  return (
    <div style={{
      background: "#2d2d2d",
      borderBottom: "1px solid #4a4a4a",
      padding: "24px 32px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {showBackButton && (
            <Link href={backHref}>
              <button style={{
                width: "40px",
                height: "40px",
                background: "#4a4a4a",
                border: "1px solid #555555",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                fontSize: "18px",
                color: "#e0e0e0"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "#555555";
                (e.target as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "#4a4a4a";
                (e.target as HTMLElement).style.transform = "translateY(0)";
              }}
              >
                ←
              </button>
            </Link>
          )}
          <div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "4px"
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#b0b0b0"
            }}>
              {subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Navigation Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {pathname !== '/dashboard' && (
              <Link href="/dashboard">
                <button style={{
                  padding: "10px 16px",
                  background: "#4a4a4a",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "#555555";
                  (e.target as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "#4a4a4a";
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                }}
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </button>
              </Link>
            )}

            {pathname !== '/trainings' && (
              <Link href="/trainings">
                <button style={{
                  padding: "10px 16px",
                  background: "#4a4a4a",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "#555555";
                  (e.target as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "#4a4a4a";
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                }}
                >
                  <span>📋</span>
                  <span>Trainings</span>
                </button>
              </Link>
            )}
          </div>

          {/* Status Indicator */}
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: "11px", color: "#b0b0b0", marginBottom: "2px" }}>Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                background: "#007acc",
                borderRadius: "50%"
              }} />
              <span style={{ color: "#007acc", fontSize: "11px", fontWeight: 500 }}>ONLINE</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "1px solid #555555",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: "#4a4a4a",
              color: "#e0e0e0"
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#ff6b6b";
              (e.target as HTMLElement).style.borderColor = "#ff6b6b";
              (e.target as HTMLElement).style.color = "#ffffff";
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "#4a4a4a";
              (e.target as HTMLElement).style.borderColor = "#555555";
              (e.target as HTMLElement).style.color = "#e0e0e0";
              (e.target as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <span>←</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}