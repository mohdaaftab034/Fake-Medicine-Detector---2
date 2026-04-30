import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { ROUTES } from '../utils/constants.js';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md"
      >
        {/* 404 Illustration */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
        >
          404
        </motion.div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">Oops! Medicine Not Found</h1>
          <p className="text-text-secondary text-lg">
            This page doesn't exist in our MediGuard database. Let's get you back on track.
          </p>
        </div>

        {/* Illustration with icons */}
        <div className="py-8">
          <div className="flex justify-center gap-4 text-5xl animate-bounce">
            <span>💊</span>
            <span style={{ animationDelay: '0.1s' }}>❓</span>
            <span style={{ animationDelay: '0.2s' }}>⚠️</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to={ROUTES.HOME} className="btn-primary w-full inline-flex items-center justify-center gap-2">
            <Home size={20} />
            Go to Home
          </Link>
          <Link to={ROUTES.SCANNER} className="btn-secondary w-full">
            Start Scanning
          </Link>
        </div>

        {/* Help Box */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2">
          <p className="flex items-center gap-2 text-primary font-semibold">
            <AlertCircle size={18} />
            Helpful Links
          </p>
          <ul className="text-text-secondary text-sm space-y-1">
            <li>
              <Link to={ROUTES.BATCH_VERIFY} className="text-primary hover:underline">
                → Verify Batch Number
              </Link>
            </li>
            <li>
              <Link to={ROUTES.MEDICINE_INFO} className="text-primary hover:underline">
                → Medicine Information
              </Link>
            </li>
            <li>
              <Link to={ROUTES.ALERTS} className="text-primary hover:underline">
                → View Active Alerts
              </Link>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
