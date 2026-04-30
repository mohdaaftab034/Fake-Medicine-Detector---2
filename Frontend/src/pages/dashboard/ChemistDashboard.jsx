import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { AppContext } from '../../context/AppContext.jsx';
import { recalledBatches, genuineBatches, REPORTS } from '../../utils/mockData.js';
import toast from 'react-hot-toast';

const ChemistDashboard = () => {
  const { user } = useContext(AuthContext);
  const { recentReports } = useContext(AppContext);
  const [batchInput, setBatchInput] = useState('');
  const [batchResult, setBatchResult] = useState(null);

  const handleBatchVerify = () => {
    if (!batchInput) {
      toast.error('Please enter a batch number');
      return;
    }

    const isRecalled = recalledBatches.find((b) => b.batch === batchInput);
    const isGenuine = genuineBatches.includes(batchInput);

    if (isRecalled) {
      setBatchResult({
        status: 'RECALLED',
        color: 'danger',
        message: `Batch ${batchInput} has been recalled!`,
        details: isRecalled,
      });
      toast.error('⚠️ This batch is RECALLED');
    } else if (isGenuine) {
      setBatchResult({
        status: 'VERIFIED',
        color: 'success',
        message: `Batch ${batchInput} is verified genuine!`,
      });
      toast.success('✓ Batch verified genuine');
    } else {
      setBatchResult({
        status: 'UNVERIFIED',
        color: 'warning',
        message: `Batch ${batchInput} status is unknown`,
      });
      toast('ℹ️ Batch status unknown - exercise caution', { icon: 'ⓘ' });
    }
  };

  const shopReports = recentReports?.filter((r) => r.location.includes('Bangalore')) || [];

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">Chemist Dashboard</h1>
          <p className="text-text-secondary">Manage your shop and verify medicines</p>
        </motion.div>

        {/* Shop Profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary border border-border-color rounded-xl p-6 mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" />
                {user?.name || 'Pharmacy'}
              </h2>
              <p className="text-text-secondary mb-3">License: {user?.licenseNumber}</p>
              <span className="inline-block px-4 py-2 rounded-full bg-success/20 text-success font-semibold text-sm">
                {user?.isVerified ? '✓ Verified Seller' : 'Pending Verification'}
              </span>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        {/* Batch Verification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-secondary border border-border-color rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4">Verify Batch Number</h2>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Enter batch number (e.g., REC2024001)"
              className="flex-1 px-4 py-3 rounded-lg bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleBatchVerify}
              className="px-6 py-3 bg-primary text-bg-primary rounded-lg font-semibold hover:bg-secondary transition-all"
            >
              Verify
            </button>
          </div>

          {batchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-l-4 ${
                batchResult.color === 'success'
                  ? 'bg-success/10 border-success'
                  : batchResult.color === 'danger'
                  ? 'bg-danger/10 border-danger'
                  : 'bg-warning/10 border-warning'
              }`}
            >
              <h3
                className={`font-bold mb-2 ${
                  batchResult.color === 'success'
                    ? 'text-success'
                    : batchResult.color === 'danger'
                    ? 'text-danger'
                    : 'text-warning'
                }`}
              >
                {batchResult.status}
              </h3>
              <p className="text-text-primary">{batchResult.message}</p>
              {batchResult.details && (
                <div className="mt-3 text-sm text-text-secondary">
                  <p>Reason: {batchResult.details.reason}</p>
                  <p>Authority: {batchResult.details.authority}</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Reports Against Shop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-border-color rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-warning" />
            Reports Against Your Shop
          </h2>
          {shopReports.length > 0 ? (
            <div className="space-y-4">
              {shopReports.map((report) => (
                <div key={report.id} className="bg-bg-primary rounded-lg p-4 border border-border-color/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-text-primary font-semibold">{report.medicineName}</h3>
                    <span className="text-xs text-text-secondary">{report.id}</span>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">{report.date}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === 'confirmed'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No reports filed against your shop. Great work!</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChemistDashboard;
