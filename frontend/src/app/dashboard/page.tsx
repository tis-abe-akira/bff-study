'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar, Shield } from 'lucide-react';

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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">CyberFit Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {user?.name || 'Training Operative'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">System Status</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                  <span className="text-secondary text-sm font-medium">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Training Sessions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="card-cyber p-6 hover:border-primary/40 transition-all duration-300 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">147</div>
                <div className="text-xs text-gray-400">SESSIONS</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">Total Training Sessions</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
              <span className="text-secondary text-sm">+12% this week</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Training Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="card-cyber p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Training Sessions</h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Strength Circuit Alpha', duration: '45 min', completion: '100%', type: 'strength' },
                  { name: 'Cardio Burn Protocol', duration: '30 min', completion: '95%', type: 'cardio' },
                  { name: 'Flexibility Matrix', duration: '20 min', completion: '100%', type: 'flexibility' },
                  { name: 'Core Stability Drill', duration: '25 min', completion: '88%', type: 'core' }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg glass-effect hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${
                        session.type === 'strength' ? 'bg-primary/20' :
                        session.type === 'cardio' ? 'bg-secondary/20' :
                        session.type === 'flexibility' ? 'bg-accent/20' : 'bg-primary/20'
                      } flex items-center justify-center`}>
                        <Activity className={`w-5 h-5 ${
                          session.type === 'strength' ? 'text-primary' :
                          session.type === 'cardio' ? 'text-secondary' :
                          session.type === 'flexibility' ? 'text-accent' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{session.name}</div>
                        <div className="text-gray-400 text-sm">{session.duration}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-medium">{session.completion}</div>
                      <div className="text-gray-400 text-sm">Complete</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Profile Status */}
            <div className="card-cyber p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Profile Status</h3>
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white text-sm">{user?.id?.slice(-8) || 'de905ed2'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white text-sm">{user?.email || 'test@example.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Access Level</span>
                  <span className="text-secondary text-sm">ELITE</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-cyber p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="max-w-xs mx-auto btn-cyber py-3 px-6 text-sm flex items-center justify-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Start New Session
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
