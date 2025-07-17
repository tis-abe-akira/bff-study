'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Activity, Clock, Target, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewTrainingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    durationMinutes: '',
    difficulty: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setMounted(true);
    fetchTypes();
    fetchDifficulties();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/trainings/types', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchDifficulties = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/trainings/difficulties', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDifficulties(data);
      }
    } catch (error) {
      console.error('Error fetching difficulties:', error);
    }
  };

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
    return <div className="min-h-screen bg-dark" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/trainings">
              <button className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 flex items-center justify-center group">
                <ArrowLeft className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Create New Training
              </h1>
              <p className="text-gray-400">
                Design your next training protocol
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-cyber p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Title */}
            <div>
              <label className="flex items-center space-x-2 text-white font-medium mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <span>Training Title</span>
                <span className="text-red-400 text-sm">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter training title..."
                className={`w-full px-4 py-4 bg-dark border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-lg ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.title && <p className="mt-2 text-red-400 text-sm">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center space-x-2 text-white font-medium mb-3">
                <FileText className="w-5 h-5 text-secondary" />
                <span>Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your training protocol..."
                rows={5}
                className="w-full px-4 py-4 bg-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all duration-200 resize-none text-lg"
              />
            </div>

            {/* Type and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Target className="w-5 h-5 text-accent" />
                  <span>Training Type</span>
                  <span className="text-red-400 text-sm">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-dark border rounded-lg text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-lg ${
                    errors.type ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select type...</option>
                  {types.map((type) => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="mt-2 text-red-400 text-sm">{errors.type}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span>Difficulty</span>
                  <span className="text-red-400 text-sm">*</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 bg-dark border rounded-lg text-white focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 text-lg ${
                    errors.difficulty ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select difficulty...</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty} className="capitalize">
                      {difficulty}
                    </option>
                  ))}
                </select>
                {errors.difficulty && <p className="mt-2 text-red-400 text-sm">{errors.difficulty}</p>}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center space-x-2 text-white font-medium mb-3">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Duration (minutes)</span>
                <span className="text-red-400 text-sm">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                placeholder="30"
                min="1"
                className={`w-full px-4 py-4 bg-dark border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all duration-200 text-lg ${
                  errors.durationMinutes ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.durationMinutes && <p className="mt-2 text-red-400 text-sm">{errors.durationMinutes}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8">
              <Link href="/trainings">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-cyber flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? 'Creating...' : 'Create Training'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}