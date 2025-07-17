'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id?: string;
  name?: string;
  email?: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    // Get user info from BFF with credentials
    fetch('http://localhost:8080/api/auth/status', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Failed to get user info:', err));
  }, []);

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

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#1a1a1a" }} />;
  }

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      background: "#1a1a1a",
      minHeight: "100vh",
      color: "#ffffff"
    }}>
      {/* Header */}
      <div style={{
        background: "#2d2d2d",
        borderBottom: "1px solid #4a4a4a",
        padding: "32px 40px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "#ffffff"
            }}>
              Training Dashboard
            </h1>
            <p style={{
              fontSize: "16px",
              color: "#b0b0b0"
            }}>
              Welcome back, {user?.name || 'Training Operative'}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "right" as const }}>
              <div style={{ fontSize: "12px", color: "#b0b0b0", marginBottom: "4px" }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  background: "#007acc",
                  borderRadius: "50%"
                }} />
                <span style={{ color: "#007acc", fontSize: "12px", fontWeight: 500 }}>ONLINE</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
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
                e.target.style.background = "#ff6b6b";
                e.target.style.borderColor = "#ff6b6b";
                e.target.style.color = "#ffffff";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#4a4a4a";
                e.target.style.borderColor = "#555555";
                e.target.style.color = "#e0e0e0";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <span>←</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "0 40px"
      }}>
        {/* Stats Overview */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "40px"
        }}>
          {/* Total Sessions Card */}
          <div style={{
            background: "#2d2d2d",
            borderRadius: "8px",
            padding: "32px",
            border: "1px solid #4a4a4a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "#007acc20",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <span style={{ color: "#007acc", fontSize: "20px" }}>📊</span>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff" }}>147</div>
                <div style={{ fontSize: "12px", color: "#b0b0b0" }}>SESSIONS</div>
              </div>
            </div>
            <div style={{ fontSize: "16px", color: "#b0b0b0", marginBottom: "12px" }}>
              Total Training Sessions
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#007acc", fontSize: "14px" }}>↗</span>
              <span style={{ color: "#007acc", fontSize: "14px" }}>+12% this week</span>
            </div>
          </div>

          {/* Average Duration Card */}
          <div style={{
            background: "#2d2d2d",
            borderRadius: "8px",
            padding: "32px",
            border: "1px solid #4a4a4a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "#00d2ff20",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <span style={{ color: "#00d2ff", fontSize: "20px" }}>⏱️</span>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff" }}>42</div>
                <div style={{ fontSize: "12px", color: "#b0b0b0" }}>MINUTES</div>
              </div>
            </div>
            <div style={{ fontSize: "16px", color: "#b0b0b0", marginBottom: "12px" }}>
              Average Duration
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#00d2ff", fontSize: "14px" }}>→</span>
              <span style={{ color: "#00d2ff", fontSize: "14px" }}>Steady pace</span>
            </div>
          </div>

          {/* Completion Rate Card */}
          <div style={{
            background: "#2d2d2d",
            borderRadius: "8px",
            padding: "32px",
            border: "1px solid #4a4a4a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "#00ff9520",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <span style={{ color: "#00ff95", fontSize: "20px" }}>🎯</span>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff" }}>94%</div>
                <div style={{ fontSize: "12px", color: "#b0b0b0" }}>COMPLETE</div>
              </div>
            </div>
            <div style={{ fontSize: "16px", color: "#b0b0b0", marginBottom: "12px" }}>
              Completion Rate
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#00ff95", fontSize: "14px" }}>↗</span>
              <span style={{ color: "#00ff95", fontSize: "14px" }}>Excellent</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "40px"
        }}>
          {/* Recent Sessions */}
          <div style={{
            background: "#2d2d2d",
            borderRadius: "8px",
            padding: "32px",
            border: "1px solid #4a4a4a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#ffffff",
                margin: 0
              }}>
                Recent Training Sessions
              </h2>
              <span style={{ fontSize: "18px" }}>📅</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { name: 'Strength Circuit Alpha', duration: '45 min', completion: '100%', type: '💪' },
                { name: 'Cardio Burn Protocol', duration: '30 min', completion: '95%', type: '🏃' },
                { name: 'Flexibility Matrix', duration: '20 min', completion: '100%', type: '🧘' },
                { name: 'Core Stability Drill', duration: '25 min', completion: '88%', type: '⚡' }
              ].map((session, index) => (
                <div key={index} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px",
                  background: "#3a3a3a",
                  borderRadius: "6px",
                  border: "1px solid #555555"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#007acc20",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px"
                    }}>
                      {session.type}
                    </div>
                    <div>
                      <div style={{ color: "#ffffff", fontWeight: 500, fontSize: "16px" }}>
                        {session.name}
                      </div>
                      <div style={{ color: "#b0b0b0", fontSize: "14px" }}>
                        {session.duration}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ color: "#007acc", fontWeight: 600, fontSize: "16px" }}>
                      {session.completion}
                    </div>
                    <div style={{ color: "#b0b0b0", fontSize: "12px" }}>
                      Complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Profile Status */}
            <div style={{
              background: "#2d2d2d",
              borderRadius: "8px",
              padding: "32px",
              border: "1px solid #4a4a4a",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: 0
                }}>
                  Profile Status
                </h3>
                <span style={{ fontSize: "18px" }}>🛡️</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#b0b0b0", fontSize: "14px" }}>User ID</span>
                  <span style={{ color: "#ffffff", fontSize: "14px" }}>
                    {user?.id?.slice(-8) || 'de905ed2'}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#b0b0b0", fontSize: "14px" }}>Email</span>
                  <span style={{ color: "#ffffff", fontSize: "14px" }}>
                    {user?.email || 'test@example.com'}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#b0b0b0", fontSize: "14px" }}>Access Level</span>
                  <span style={{ color: "#007acc", fontSize: "14px", fontWeight: 600 }}>ELITE</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "#2d2d2d",
              borderRadius: "8px",
              padding: "32px",
              border: "1px solid #4a4a4a",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
                margin: "0 0 20px 0"
              }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link href="/trainings/new">
                  <button style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "#007acc",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#0066aa";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 122, 204, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#007acc";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                  >
                    <span>📝</span>
                    <span>Create New Training</span>
                  </button>
                </Link>
                <Link href="/trainings">
                  <button style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "1px solid #555555",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "#4a4a4a",
                    color: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#555555";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#4a4a4a";
                    e.target.style.transform = "translateY(0)";
                  }}
                  >
                    <span>📋</span>
                    <span>View All Trainings</span>
                  </button>
                </Link>
                <button style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: "#4a4a4a",
                  color: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#555555";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#4a4a4a";
                  e.target.style.transform = "translateY(0)";
                }}
                >
                  <span>📈</span>
                  <span>Analytics Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
