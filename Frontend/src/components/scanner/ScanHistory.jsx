import React, { useEffect, useState, useContext } from 'react';
import { Clock, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext.jsx';
import { formatDateTime } from '../../utils/helpers.js';

const ScanHistory = () => {
  const { scanHistory } = useContext(AppContext);
  const [displayedScans, setDisplayedScans] = useState([]);

  useEffect(() => {
    setDisplayedScans(scanHistory.slice(0, 5));
  }, [scanHistory]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'genuine':
        return <Check size={18} className="text-success" />;
      case 'fake':
        return <X size={18} className="text-danger" />;
      case 'suspicious':
        return <AlertTriangle size={18} className="text-warning" />;
      default:
        return <Clock size={18} className="text-text-secondary" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'genuine':
        return 'bg-success/20 text-success';
      case 'fake':
        return 'bg-danger/20 text-danger';
      case 'suspicious':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-bg-secondary text-text-secondary';
    }
  };

  if (displayedScans.length === 0) {
    return (
      <div className="card text-center py-8">
        <Clock size={32} className="mx-auto text-text-secondary mb-4" />
        <p className="text-text-secondary">No scan history yet. Start by scanning a medicine!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        <Clock size={20} />
        Recent Scans
      </h3>
      <div className="space-y-3">
        {displayedScans.map((scan, index) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary hover:border-primary/50 border border-border-color transition-smooth"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(scan.status)}
              <div>
                <p className="font-medium text-text-primary">{scan.medicineName}</p>
                <p className="text-xs text-text-secondary">{formatDateTime(scan.date)}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(scan.status)}`}>
              {scan.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;
