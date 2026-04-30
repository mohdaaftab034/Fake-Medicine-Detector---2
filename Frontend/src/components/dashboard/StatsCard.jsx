import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, title, value, trend, trendUp = true, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/20 text-primary border-primary/30',
    success: 'bg-success/20 text-success border-success/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`card border-2 ${colorClasses[color]} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trendUp ? 'text-success' : 'text-danger'
            }`}
          >
            <TrendingUp size={16} className={trendUp ? '' : 'rotate-180'} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-text-secondary text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
