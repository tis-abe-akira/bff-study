'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: '',
    durationMinutes: '',
    difficulty: ''
  });

  const types = ['strength', 'cardio', 'flexibility', 'core'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    setMounted(true);
    if (params.id) {
      fetchTraining();
    }
  }, [params.id]);

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/trainings/${params.id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTraining(data);
        setEditForm({
          title: data.title,
          description: data.description || '',
          type: data.type,
          durationMinutes: data.durationMinutes.toString(),
          difficulty: data.difficulty
        });
      } else if (response.status === 404) {
        setError('Training not found');
      } else {
        setError('Failed to fetch training');
      }
    } catch (error) {
      console.error('Error fetching training:', error);
      setError('Failed to fetch training');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this training?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/trainings/${params.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        router.push('/trainings');
      } else {
        console.error('Failed to delete training');
      }
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (training) {
      setEditForm({
        title: training.title,
        description: training.description || '',
        type: training.type,
        durationMinutes: training.durationMinutes.toString(),
        difficulty: training.difficulty
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/trainings/${params.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          durationMinutes: parseInt(editForm.durationMinutes)
        })
      });

      if (response.ok) {
        const updatedTraining = await response.json();
        setTraining(updatedTraining);
        setIsEditing(false);
      } else {
        console.error('Failed to update training');
      }
    } catch (error) {
      console.error('Error updating training:', error);
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

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#1a1a1a" }} />;
  }

  if (loading) {
    return (
      <div style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        background: "#1a1a1a",
        minHeight: "100vh",
        color: "#ffffff"
      }}>
        <Header 
          title="Training Details" 
          subtitle="Loading training information"
          showBackButton={true}
          backHref="/trainings"
        />
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
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        background: "#1a1a1a",
        minHeight: "100vh",
        color: "#ffffff"
      }}>
        <Header 
          title="Training Details" 
          subtitle="Error loading training"
          showBackButton={true}
          backHref="/trainings"
        />
        <div style={{
          textAlign: "center" as const,
          padding: "64px 32px",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <h3 style={{
            fontSize: "18px",
            color: "#ff6b6b",
            marginBottom: "16px"
          }}>
            {error}
          </h3>
          <Link href="/trainings">
            <button style={{
              padding: "12px 24px",
              background: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer"
            }}>
              Back to Trainings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!training) {
    return null;
  }

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      background: "#1a1a1a",
      minHeight: "100vh",
      color: "#ffffff"
    }}>
      <Header 
        title={isEditing ? "Edit Training" : "Training Details"}
        subtitle={isEditing ? "Update your training protocol" : training.title}
        showBackButton={true}
        backHref="/trainings"
      />

      <div style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "0 32px"
      }}>
        <div style={{
          background: "#2d2d2d",
          borderRadius: "8px",
          border: "1px solid #4a4a4a",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          {/* Header Section */}
          <div style={{
            padding: "32px",
            borderBottom: "1px solid #4a4a4a"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <span style={{
                  fontSize: "24px"
                }}>
                  {getTypeEmoji(training.type)}
                </span>
                <div>
                  <h1 style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: 0
                  }}>
                    {training.title}
                  </h1>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#b0b0b0"
                  }}>
                    <span>💪 {training.type}</span>
                    <span>⭐ {training.difficulty}</span>
                    <span>⏱️ {training.durationMinutes} min</span>
                  </div>
                </div>
              </div>
              
              {!isEditing && (
                <div style={{
                  display: "flex",
                  gap: "12px"
                }}>
                  <button
                    onClick={handleEdit}
                    style={{
                      padding: "10px 20px",
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
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "#007acc";
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: "10px 20px",
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = "#ff5252";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "#ff6b6b";
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: "32px" }}>
            {!isEditing ? (
              // View Mode
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#e0e0e0",
                    marginBottom: "8px"
                  }}>
                    Description
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#b0b0b0",
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {training.description || 'No description provided'}
                  </p>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "24px"
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#e0e0e0",
                      marginBottom: "8px"
                    }}>
                      Training Type
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "#b0b0b0",
                      margin: 0
                    }}>
                      {training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#e0e0e0",
                      marginBottom: "8px"
                    }}>
                      Difficulty
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "#b0b0b0",
                      margin: 0
                    }}>
                      {training.difficulty.charAt(0).toUpperCase() + training.difficulty.slice(1)}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#e0e0e0",
                    marginBottom: "8px"
                  }}>
                    Duration
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#b0b0b0",
                    margin: 0
                  }}>
                    {training.durationMinutes} minutes
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#888888",
                  paddingTop: "16px",
                  borderTop: "1px solid #4a4a4a"
                }}>
                  <span>Created: {new Date(training.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(training.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#e0e0e0",
                    fontSize: "14px"
                  }}>
                    Training Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #555555",
                      borderRadius: "6px",
                      background: "#3a3a3a",
                      color: "#ffffff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#e0e0e0",
                    fontSize: "14px"
                  }}>
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #555555",
                      borderRadius: "6px",
                      background: "#3a3a3a",
                      color: "#ffffff",
                      fontSize: "14px",
                      resize: "vertical" as const
                    }}
                  />
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "24px"
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 500,
                      color: "#e0e0e0",
                      fontSize: "14px"
                    }}>
                      Training Type
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #555555",
                        borderRadius: "6px",
                        background: "#3a3a3a",
                        color: "#ffffff",
                        fontSize: "14px"
                      }}
                    >
                      {types.map((type) => (
                        <option key={type} value={type} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 500,
                      color: "#e0e0e0",
                      fontSize: "14px"
                    }}>
                      Difficulty
                    </label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #555555",
                        borderRadius: "6px",
                        background: "#3a3a3a",
                        color: "#ffffff",
                        fontSize: "14px"
                      }}
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#e0e0e0",
                    fontSize: "14px"
                  }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
                    min="1"
                    max="300"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #555555",
                      borderRadius: "6px",
                      background: "#3a3a3a",
                      color: "#ffffff",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "flex-end",
                  paddingTop: "16px",
                  borderTop: "1px solid #4a4a4a"
                }}>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: "12px 24px",
                      border: "1px solid #555555",
                      borderRadius: "6px",
                      background: "#4a4a4a",
                      color: "#e0e0e0",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "12px 24px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#007acc",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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