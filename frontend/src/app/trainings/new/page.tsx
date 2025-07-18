'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function NewTrainingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    durationMinutes: '',
    difficulty: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // フロントエンドで選択肢を定義
  const types = ['strength', 'cardio', 'flexibility', 'core'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.durationMinutes) {
      newErrors.durationMinutes = 'Duration is required';
    } else if (parseInt(formData.durationMinutes) <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/trainings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          durationMinutes: parseInt(formData.durationMinutes)
        })
      });

      if (response.ok) {
        router.push('/trainings');
      } else {
        const errorData = await response.json();
        console.error('Failed to create training:', errorData);
      }
    } catch (error) {
      console.error('Error creating training:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#1a1a1a" }} />;
  }

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    border: "1px solid #555555",
    borderRadius: "6px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    background: "#3a3a3a",
    color: "#ffffff",
    fontFamily: "inherit"
  };

  const selectStyle = {
    width: "100%",
    padding: "16px 20px",
    border: "1px solid #555555",
    borderRadius: "6px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    backgroundColor: "#3a3a3a",
    color: "#ffffff",
    fontFamily: "inherit",
    cursor: "pointer",
    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23888888\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "12px",
    appearance: "none" as const
  };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      background: "#1a1a1a",
      minHeight: "100vh",
      color: "#ffffff"
    }}>
      <Header 
        title="Create New Training" 
        subtitle="Design your next training protocol"
        showBackButton={true}
        backHref="/trainings"
      />

      <div style={{
        background: "#2d2d2d",
        maxWidth: "600px",
        margin: "20px auto",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        
        {/* Form */}
        <div style={{ padding: "40px" }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#e0e0e0",
                fontSize: "14px"
              }}>
                Training Title <span style={{ color: "#ff6b6b" }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter training title..."
                style={{
                  ...inputStyle,
                  borderColor: errors.title ? "#ff6b6b" : "#555555"
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.outline = "none";
                  (e.target as HTMLElement).style.borderColor = "#007acc";
                  (e.target as HTMLElement).style.backgroundColor = "#404040";
                  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  if (!errors.title) {
                    (e.target as HTMLElement).style.borderColor = "#555555";
                    (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }
                }}
              />
              {errors.title && <p style={{ marginTop: "6px", fontSize: "12px", color: "#ff6b6b" }}>{errors.title}</p>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: "32px" }}>
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
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your training protocol..."
                rows={5}
                style={{
                  ...inputStyle,
                  minHeight: "120px",
                  resize: "vertical" as const,
                  lineHeight: 1.6
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.outline = "none";
                  (e.target as HTMLElement).style.borderColor = "#007acc";
                  (e.target as HTMLElement).style.backgroundColor = "#404040";
                  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = "#555555";
                  (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
                  (e.target as HTMLElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* Type and Difficulty */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                  color: "#e0e0e0",
                  fontSize: "14px"
                }}>
                  Training Type <span style={{ color: "#ff6b6b" }}>*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={{
                    ...selectStyle,
                    borderColor: errors.type ? "#ff6b6b" : "#555555"
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.outline = "none";
                    (e.target as HTMLElement).style.borderColor = "#007acc";
                    (e.target as HTMLElement).style.backgroundColor = "#404040";
                    (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                  }}
                  onBlur={(e) => {
                    if (!errors.type) {
                      (e.target as HTMLElement).style.borderColor = "#555555";
                      (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
                      (e.target as HTMLElement).style.boxShadow = "none";
                    }
                  }}
                >
                  <option value="" style={{ background: "#3a3a3a", color: "#ffffff" }}>Select type...</option>
                  {types.map((type) => (
                    <option key={type} value={type} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <p style={{ marginTop: "6px", fontSize: "12px", color: "#ff6b6b" }}>{errors.type}</p>}
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                  color: "#e0e0e0",
                  fontSize: "14px"
                }}>
                  Difficulty <span style={{ color: "#ff6b6b" }}>*</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  style={{
                    ...selectStyle,
                    borderColor: errors.difficulty ? "#ff6b6b" : "#555555"
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.outline = "none";
                    (e.target as HTMLElement).style.borderColor = "#007acc";
                    (e.target as HTMLElement).style.backgroundColor = "#404040";
                    (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                  }}
                  onBlur={(e) => {
                    if (!errors.difficulty) {
                      (e.target as HTMLElement).style.borderColor = "#555555";
                      (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
                      (e.target as HTMLElement).style.boxShadow = "none";
                    }
                  }}
                >
                  <option value="" style={{ background: "#3a3a3a", color: "#ffffff" }}>Select difficulty...</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty} style={{ background: "#3a3a3a", color: "#ffffff" }}>
                      {difficulty}
                    </option>
                  ))}
                </select>
                {errors.difficulty && <p style={{ marginTop: "6px", fontSize: "12px", color: "#ff6b6b" }}>{errors.difficulty}</p>}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#e0e0e0",
                fontSize: "14px"
              }}>
                Duration (minutes) <span style={{ color: "#ff6b6b" }}>*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                placeholder="60"
                min="1"
                max="300"
                style={{
                  ...inputStyle,
                  borderColor: errors.durationMinutes ? "#ff6b6b" : "#555555"
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.outline = "none";
                  (e.target as HTMLElement).style.borderColor = "#007acc";
                  (e.target as HTMLElement).style.backgroundColor = "#404040";
                  (e.target as HTMLElement).style.boxShadow = "0 0 0 2px rgba(0, 122, 204, 0.2)";
                }}
                onBlur={(e) => {
                  if (!errors.durationMinutes) {
                    (e.target as HTMLElement).style.borderColor = "#555555";
                    (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }
                }}
              />
              {errors.durationMinutes && <p style={{ marginTop: "6px", fontSize: "12px", color: "#ff6b6b" }}>{errors.durationMinutes}</p>}
            </div>

            {/* Submit Buttons */}
            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid #4a4a4a"
            }}>
              <Link href="/trainings">
                <button
                  type="button"
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #555555",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minWidth: "120px",
                    background: "#4a4a4a",
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
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "120px",
                  background: "#007acc",
                  color: "white",
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.background = "#0066aa";
                    (e.target as HTMLElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0, 122, 204, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.background = "#007acc";
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Training'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}