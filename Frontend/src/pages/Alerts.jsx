import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Zap, AlertCircle, X } from 'lucide-react';
import { AppContext } from '../context/AppContext.jsx';
import { formatDateTime, getSeverityColor, getSeverityBgColor } from '../utils/helpers.js';
import { ALERTS } from '../utils/mockData.js';

const Alerts = () => {
  const { activeAlerts, markAlertAsRead, dismissAlert } = useContext(AppContext);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filteredAlerts, setFilteredAlerts] = useState(activeAlerts);

  React.useEffect(() => {
    let filtered = activeAlerts;

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === filterSeverity);
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    setFilteredAlerts(filtered);
  }, [activeAlerts, filterSeverity]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle size={20} className="text-danger animate-pulse" />;
      case 'high':
        return <Zap size={20} className="text-warning" />;
      case 'medium':
        return <AlertCircle size={20} className="text-primary" />;
      case 'low':
        return <CheckCircle size={20} className="text-success" />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Active <span className="text-danger">Alerts</span>
          </h1>
          <p className="text-text-secondary">
            Real-time government alerts about fake medicines and drug recalls
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-smooth ${
              filterSeverity === 'all'
                ? 'bg-primary text-bg-primary'
                : 'bg-bg-secondary text-text-secondary hover:text-primary'
            }`}
          >
            All ({activeAlerts.length})
          </button>
          {['critical', 'high', 'medium', 'low'].map((severity) => {
            const count = activeAlerts.filter((a) => a.severity === severity).length;
            return (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-lg font-semibold transition-smooth capitalize ${
                  filterSeverity === severity
                    ? `${getSeverityBgColor(severity)} ${getSeverityColor(severity)}`
                    : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {severity} ({count})
              </button>
            );
          })}
        </motion.div>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`card border-l-4 space-y-4 ${
                  alert.severity === 'critical'
                    ? 'border-danger'
                    : alert.severity === 'high'
                    ? 'border-warning'
                    : alert.severity === 'medium'
                    ? 'border-primary'
                    : 'border-success'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary flex-1">{alert.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityBgColor(
                            alert.severity
                          )} ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-text-secondary mb-3">{alert.description}</p>

                      {/* Affected Areas */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alert.affectedArea.map((area) => (
                          <span
                            key={area}
                            className="px-3 py-1 rounded-full bg-bg-secondary border border-primary/30 text-primary text-xs"
                          >
                            📍 {area}
                          </span>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-text-secondary text-sm">
                        <span>Source: {alert.source}</span>
                        <span>Date: {formatDateTime(alert.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!alert.read && (
                      <motion.button
                        onClick={() => markAlertAsRead(alert.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-smooth"
                        title="Mark as read"
                      >
                        ✓
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => dismissAlert(alert.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-smooth"
                      title="Dismiss"
                    >
                      <X size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16 space-y-4">
            <CheckCircle size={48} className="mx-auto text-success" />
            <h3 className="text-2xl font-semibold text-text-primary">No Alerts</h3>
            <p className="text-text-secondary">
              {filterSeverity === 'all'
                ? 'No active alerts at the moment. Your area seems safe!'
                : `No ${filterSeverity} severity alerts.`}
            </p>
          </div>
        )}

        {/* Emergency Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 p-6 rounded-lg bg-danger/10 border-2 border-danger/30 space-y-3"
        >
          <h3 className="text-lg font-semibold text-danger flex items-center gap-2">
            <AlertTriangle size={20} />
            Emergency?
          </h3>
          <p className="text-danger/80">
            If you have consumed a fake medicine or face any adverse effects, contact CDSCO immediately:
          </p>
          <p className="text-danger font-bold text-lg">📞 Helpline: 1800-180-3024</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Alerts;
