'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Training {
  id: number;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrainingsPage() {
  const [mounted, setMounted] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // フロントエンドで選択肢を定義
  const types = ['strength', 'cardio', 'flexibility', 'core'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    setMounted(true);
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const response = await fetch(`http://localhost:8080/api/proxy/trainings?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrainings(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch trainings:', response.status);
        setTrainings([]);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = () => {
    fetchTrainings();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/trainings/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setTrainings(trainings.filter(t => t.id !== id));
      } else {
        console.error('Failed to delete training');
      }
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'cardio': return '🏃';
      case 'flexibility': return '🧘';
      case 'core': return '⚡';
      default: return '🏋️';
    }
  };

  const getDifficultyText = (difficulty: string, type: string) => {
    const typeText = type === 'strength' ? 'High intensity' : 
                    type === 'cardio' ? 'Easy pace' : 
                    type === 'flexibility' ? 'Gentle stretch' : 
                    'Medium intensity';
    return typeText;
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
      <Header 
        title="Training Sessions" 
        subtitle="Manage your cyber training protocols"
      />

      {/* Action Bar */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px 32px 0 32px",
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <Link href="/trainings/new">
          <button style={{
            padding: "12px 24px",
            background: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "#0066aa";
            (e.target as HTMLElement).style.transform = "translateY(-1px)";
            (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0, 122, 204, 0.3)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "#007acc";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            (e.target as HTMLElement).style.boxShadow = "none";
          }}
          >
            <span>+</span>
            <span>New Training</span>
          </button>
        </Link>
      </div>

      {/* Container */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px 32px 32px 32px"
      }}>
        {/* Filters Section */}
        <div style={{
          background: "#2d2d2d",
          borderRadius: "8px",
          border: "1px solid #4a4a4a",
          padding: "32px",
          marginBottom: "32px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "24px",
            marginBottom: "24px"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <label style={{
                fontSize: "14px",
                color: "#b0b0b0",
                fontWeight: 500
              }}>
                Search trainings
              </label>
              <input
                type="text"
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  background: "#3a3a3a",
                  color: "#ffffff",
                  fontSize: "14px",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.borderColor = "#007acc";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#555555";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <label style={{
                fontSize: "14px",
                color: "#b0b0b0",
                fontWeight: 500
              }}>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  background: "#3a3a3a",
                  color: "#ffffff",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23888888\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "12px",
                  appearance: "none" as const
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.borderColor = "#007acc";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#555555";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="" style={{ background: "#3a3a3a", color: "#ffffff" }}>All Types</option>
                {types.map((type) => (
                  <option key={type} value={type} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <label style={{
                fontSize: "14px",
                color: "#b0b0b0",
                fontWeight: 500
              }}>
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #555555",
                  borderRadius: "6px",
                  background: "#3a3a3a",
                  color: "#ffffff",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23888888\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "12px",
                  appearance: "none" as const
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.borderColor = "#007acc";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#555555";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="" style={{ background: "#3a3a3a", color: "#ffffff" }}>All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            style={{
              padding: "12px 32px",
              background: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              alignSelf: "end",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#0066aa";
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
              (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0, 122, 204, 0.3)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "#007acc";
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (e.target as HTMLElement).style.boxShadow = "none";
            }}
          >
            <span>🔍</span>
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #4a4a4a",
              borderTop: "3px solid #007acc",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {trainings.map((training) => (
              <div
                key={training.id}
                style={{
                  background: "#2d2d2d",
                  borderRadius: "8px",
                  border: "1px solid #4a4a4a",
                  padding: "24px",
                  transition: "all 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = "#007acc";
                  (e.target as HTMLElement).style.transform = "translateY(-2px)";
                  (e.target as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = "#4a4a4a";
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                  (e.target as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}>
                      <span style={{
                        width: "20px",
                        height: "20px",
                        color: "#007acc",
                        fontSize: "16px"
                      }}>
                        ⚡
                      </span>
                      {training.title}
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "14px",
                      color: "#888888"
                    }}>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {getTypeEmoji(training.type)} {getDifficultyText(training.difficulty, training.type)}
                      </span>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        💪 {training.type}, {training.difficulty}
                      </span>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        ⏱️ {training.durationMinutes} min
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      fontSize: "12px",
                      color: "#b0b0b0",
                      textAlign: "right" as const
                    }}>
                      {new Date(training.createdAt).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                    <Link href={`/trainings/${training.id}`}>
                      <button style={{
                        padding: "8px 16px",
                        background: "#4a4a4a",
                        color: "#e0e0e0",
                        border: "1px solid #555555",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                        textDecoration: "none"
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
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Sessions */}
        {trainings.length === 0 && !loading && (
          <div style={{
            textAlign: "center" as const,
            padding: "64px 32px",
            background: "#2d2d2d",
            borderRadius: "8px",
            border: "1px solid #4a4a4a"
          }}>
            <h3 style={{
              fontSize: "18px",
              color: "#ffffff",
              marginBottom: "8px"
            }}>
              No trainings found
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#888888",
              marginBottom: "24px"
            }}>
              Create your first training session to get started
            </p>
            <Link href="/trainings/new">
              <button style={{
                padding: "12px 24px",
                background: "#007acc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "#0066aa";
                (e.target as HTMLElement).style.transform = "translateY(-1px)";
                (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0, 122, 204, 0.3)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "#007acc";
                (e.target as HTMLElement).style.transform = "translateY(0)";
                (e.target as HTMLElement).style.boxShadow = "none";
              }}
              >
                Create Training
              </button>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}