import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertBadge = ({ type = 'info', title, message, dismissible = true, onDismiss }) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      textColor: 'text-success',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/30',
      textColor: 'text-danger',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      textColor: 'text-warning',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      textColor: 'text-primary',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.textColor}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`font-semibold ${config.textColor}`}>{title}</p>}
        {message && <p className="text-text-secondary text-sm mt-1">{message}</p>}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
};

export default AlertBadge;
