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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced grid pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px),
            linear-gradient(45deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 80px 80px'
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm mx-auto relative z-10">
        {/* Compact logo and title section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center cyber-glow mb-3">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 rounded-xl blur-lg opacity-75 animate-pulse" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gradient mb-3"
          >
CyberFit
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-300 font-light"
          >
            Training Matrix Access Portal
          </motion.p>
        </motion.div>

        {/* Compact login card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <div className="card-cyber p-6 space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Access Terminal</h2>
              <p className="text-gray-400 text-sm">Initialize secure connection</p>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 212, 255, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full btn-cyber group flex items-center justify-center space-x-3 py-4 text-base relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Shield className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-semibold">AUTHENTICATE</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </motion.button>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <span className="text-primary text-xs font-medium">SECURE</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </div>

              <div className="text-xs text-gray-400">
                🛡️ KeyCloak OAuth2 • Enterprise encryption
              </div>
            </div>
          </div>
        </motion.div>

        {/* Compact features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 mb-8"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg glass-effect hover:border-primary/20 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">Quantum Security</h3>
              <p className="text-gray-400 text-xs">Military-grade protection</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg glass-effect hover:border-secondary/20 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">Neural Analytics</h3>
              <p className="text-gray-400 text-xs">AI-powered insights</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg glass-effect hover:border-accent/20 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">Bio Integration</h3>
              <p className="text-gray-400 text-xs">Adaptive training matrix</p>
            </div>
          </div>
        </motion.div>

        {/* Compact status indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex justify-center space-x-6"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-sm shadow-secondary/50 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">BACKEND</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">AUTH</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/50 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">DATABASE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}