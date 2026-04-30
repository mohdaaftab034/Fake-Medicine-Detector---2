import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-primary/90 backdrop-blur-sm z-50">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-border-color border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-border-color border-b-secondary"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-text-secondary">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-border-color border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {message && <p className="text-text-secondary mt-4">{message}</p>}
    </div>
  );
};

export default Loader;
