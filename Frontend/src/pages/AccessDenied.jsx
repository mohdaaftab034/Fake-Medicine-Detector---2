import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-6"
        >
          <Lock className="w-16 h-16 text-danger" />
        </motion.div>

        <h1 className="text-4xl font-bold text-text-primary mb-4">Access Denied</h1>
        <p className="text-text-secondary mb-8">
          Your role does not have permission to access this page. Please log in with the appropriate account.
        </p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-bg-primary rounded-lg font-semibold hover:bg-secondary transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
