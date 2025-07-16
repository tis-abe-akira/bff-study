'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, ChevronRight, Github, Twitter, Globe } from 'lucide-react';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    // Redirect to BFF OAuth2 login
    window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak';
  };

  if (!mounted) {
    return <div className="min-h-screen bg-dark" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center cyber-glow">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-accent/50 rounded-xl blur opacity-75 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold text-gradient">
                  Cyber Fitness
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300 font-light"
              >
                Advanced Training Management System
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4 p-4 rounded-xl glass-effect">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure Authentication</h3>
                  <p className="text-gray-400 text-sm">Enterprise-grade security with OAuth2</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl glass-effect">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Real-time Analytics</h3>
                  <p className="text-gray-400 text-sm">Track your progress with live metrics</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl glass-effect">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Smart Training Plans</h3>
                  <p className="text-gray-400 text-sm">AI-powered workout recommendations</p>
                </div>
              </div>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex space-x-4"
            >
              <div className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                <Github className="w-5 h-5 text-gray-400" />
              </div>
              <div className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                <Twitter className="w-5 h-5 text-gray-400" />
              </div>
              <div className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="card-cyber p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400">Sign in to access your training dashboard</p>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="w-full btn-cyber group flex items-center justify-center space-x-3 py-4 text-lg"
              >
                <Shield className="w-5 h-5" />
                <span>Sign in with KeyCloak</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="text-center space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  <span className="text-gray-500 text-sm">Secure Login</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>

                <div className="text-sm text-gray-500">
                  Protected by enterprise-grade security
                </div>
              </div>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl glass-effect">
                <div className="w-3 h-3 rounded-full bg-secondary mx-auto mb-2 animate-pulse" />
                <div className="text-xs text-gray-400">Backend</div>
              </div>
              <div className="text-center p-3 rounded-xl glass-effect">
                <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-2 animate-pulse" />
                <div className="text-xs text-gray-400">Auth</div>
              </div>
              <div className="text-center p-3 rounded-xl glass-effect">
                <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-2 animate-pulse" />
                <div className="text-xs text-gray-400">Database</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}