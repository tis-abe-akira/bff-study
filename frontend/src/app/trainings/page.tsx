'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Activity, Clock, Target, Trash2, Edit3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
  const [types, setTypes] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchTrainings();
    fetchTypes();
    fetchDifficulties();
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const response = await fetch(`http://localhost:8080/api/trainings?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      } else {
        console.error('Failed to fetch trainings');
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-primary bg-primary/20';
      case 'cardio': return 'text-secondary bg-secondary/20';
      case 'flexibility': return 'text-accent bg-accent/20';
      case 'core': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-dark" />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Training Sessions</h1>
            <p className="text-gray-400">Manage your cyber training protocols</p>
          </div>
          <Link href="/trainings/new">
            <button className="btn-cyber flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Training</span>
            </button>
          </Link>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-cyber p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-dark border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 bg-dark border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Difficulties</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty} className="capitalize">
                  {difficulty}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="btn-cyber flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Trainings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training, index) => (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="card-cyber p-6 hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {training.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {training.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(training.type)}`}>
                    {training.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(training.difficulty)}`}>
                    {training.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{training.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{new Date(training.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link href={`/trainings/${training.id}`}>
                    <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center space-x-1">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <Link href={`/trainings/edit/${training.id}`}>
                      <button className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all duration-200 flex items-center justify-center">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(training.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {trainings.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No trainings found</h3>
            <p className="text-gray-400 mb-6">Create your first training session to get started</p>
            <Link href="/trainings/new">
              <button className="btn-cyber">
                Create Training
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}