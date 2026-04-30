import React, { useContext, useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext.jsx';
import { formatDateTime, getSeverityBgColor, getSeverityColor } from '../../utils/helpers.js';

const RecentReports = () => {
  const { recentReports } = useContext(AppContext);
  const [displayReports, setDisplayReports] = useState([]);

  useEffect(() => {
    setDisplayReports(recentReports.slice(0, 8));
  }, [recentReports]);

  if (displayReports.length === 0) {
    return (
      <div className="card text-center py-8">
        <Clock size={32} className="mx-auto text-text-secondary mb-4" />
        <p className="text-text-secondary">No recent reports yet</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <AlertCircle size={20} />
        Recent Reported Cases
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-color">
              <th className="text-left px-4 py-3 text-text-secondary text-sm font-semibold">
                Medicine
              </th>
              <th className="text-left px-4 py-3 text-text-secondary text-sm font-semibold">
                Location
              </th>
              <th className="text-left px-4 py-3 text-text-secondary text-sm font-semibold">
                Status
              </th>
              <th className="text-left px-4 py-3 text-text-secondary text-sm font-semibold">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {displayReports.map((report, idx) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-border-color hover:bg-bg-secondary/50 transition-smooth"
              >
                <td className="px-4 py-3">
                  <p className="text-text-primary font-medium">{report.medicineName}</p>
                  <p className="text-text-secondary text-sm">{report.batch}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-text-primary">{report.location}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityBgColor(
                      report.severity
                    )} ${getSeverityColor(report.severity)}`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">
                  {formatDateTime(report.date)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentReports;
