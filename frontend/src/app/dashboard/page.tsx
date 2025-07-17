'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar, Shield, LogOut } from 'lucide-react';

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
    return <div className="min-h-screen bg-dark" />;
  }

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-5xl mx-auto px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 py-12 px-8 border-b border-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gradient mb-6">CyberFit Dashboard</h1>
              <p className="text-gray-400 text-xl">
                Welcome back, {user?.name || 'Training Operative'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
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
          className="mb-20 px-8"
        >
          <div className="card-cyber p-12 hover:border-primary/40 transition-all duration-300 max-w-md mx-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">147</div>
                <div className="text-sm text-gray-400">SESSIONS</div>
              </div>
            </div>
            <div className="text-base text-gray-400 mb-4">Total Training Sessions</div>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-secondary mr-2" />
              <span className="text-secondary">+12% this week</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-8">
          
          {/* Recent Training Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="card-cyber p-12 mx-4">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-bold text-white">Recent Training Sessions</h2>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="space-y-8">
                {[
                  { name: 'Strength Circuit Alpha', duration: '45 min', completion: '100%', type: 'strength' },
                  { name: 'Cardio Burn Protocol', duration: '30 min', completion: '95%', type: 'cardio' },
                  { name: 'Flexibility Matrix', duration: '20 min', completion: '100%', type: 'flexibility' },
                  { name: 'Core Stability Drill', duration: '25 min', completion: '88%', type: 'core' }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-8 mx-4 rounded-lg glass-effect hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-lg ${
                        session.type === 'strength' ? 'bg-primary/20' :
                        session.type === 'cardio' ? 'bg-secondary/20' :
                        session.type === 'flexibility' ? 'bg-accent/20' : 'bg-primary/20'
                      } flex items-center justify-center`}>
                        <Activity className={`w-6 h-6 ${
                          session.type === 'strength' ? 'text-primary' :
                          session.type === 'cardio' ? 'text-secondary' :
                          session.type === 'flexibility' ? 'text-accent' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <div className="text-white font-medium text-lg">{session.name}</div>
                        <div className="text-gray-400">{session.duration}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-medium text-lg">{session.completion}</div>
                      <div className="text-gray-400">Complete</div>
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
            className="space-y-12"
          >
            {/* Profile Status */}
            <div className="card-cyber p-12 mx-4">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Profile Status</h3>
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white">{user?.id?.slice(-8) || 'de905ed2'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{user?.email || 'test@example.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Access Level</span>
                  <span className="text-secondary">ELITE</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-cyber p-12 mx-4">
              <h3 className="text-xl font-bold text-white mb-8">Quick Actions</h3>
              <div className="flex justify-center">
                <button className="btn-cyber py-6 px-12 text-base flex items-center justify-center">
                  <Activity className="w-5 h-5 mr-3" />
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
