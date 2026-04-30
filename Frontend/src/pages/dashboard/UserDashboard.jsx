import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, AlertCircle, Zap } from 'lucide-react';
import { AppContext } from '../../context/AppContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { scanHistory, recentReports } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action === 'scan') {
      navigate('/scanner');
    } else if (action === 'report') {
      navigate('/report-fake');
    } else if (action === 'chemist') {
      navigate('/nearby-chemist');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome, {user?.name || 'User'}!</h1>
          <p className="text-text-secondary">Manage your medicine scans and reports</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            {
              icon: Zap,
              title: 'Scan Medicine',
              description: 'Check medicine authenticity',
              action: 'scan',
              color: 'primary',
            },
            {
              icon: AlertCircle,
              title: 'Report Fake',
              description: 'Report counterfeit medicine',
              action: 'report',
              color: 'danger',
            },
            {
              icon: Search,
              title: 'Find Chemist',
              description: 'Locate nearby pharmacies',
              action: 'chemist',
              color: 'success',
            },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(item.action)}
              className={`bg-bg-secondary border border-border-color rounded-xl p-6 text-left hover:border-${item.color} transition-all duration-300`}
            >
              <item.icon className={`w-8 h-8 text-${item.color} mb-3`} />
              <h3 className="text-text-primary font-semibold mb-1">{item.title}</h3>
              <p className="text-text-secondary text-sm">{item.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* My Scans */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border-color rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4">Recent Scans</h2>
          {scanHistory && scanHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border-color">
                  <tr>
                    <th className="pb-4 text-text-secondary">Medicine</th>
                    <th className="pb-4 text-text-secondary">Status</th>
                    <th className="pb-4 text-text-secondary">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((scan) => (
                    <tr key={scan.id} className="border-b border-border-color/50 hover:bg-bg-primary/50 transition">
                      <td className="py-4 text-text-primary">{scan.medicineName}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            scan.status === 'genuine'
                              ? 'bg-success/20 text-success'
                              : scan.status === 'fake'
                              ? 'bg-danger/20 text-danger'
                              : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {scan.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-text-secondary">{new Date(scan.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No scans yet. Start by scanning a medicine!</p>
          )}
        </motion.div>

        {/* My Reports */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-bg-secondary border border-border-color rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4">My Reports</h2>
          {recentReports && recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.slice(0, 5).map((report) => (
                <div key={report.id} className="bg-bg-primary rounded-lg p-4 border border-border-color/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-text-primary font-semibold">{report.medicineName}</h3>
                      <p className="text-text-secondary text-sm">{report.location}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        report.status === 'confirmed'
                          ? 'bg-danger/20 text-danger'
                          : report.status === 'investigating'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No reports submitted yet.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
