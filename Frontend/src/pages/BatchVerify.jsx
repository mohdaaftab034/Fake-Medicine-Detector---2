import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useScanner } from '../hooks/useScanner.js';
import { toast } from 'react-hot-toast';

const statusConfig = {
  RECALLED: {
    icon: ShieldX,
    title: 'Officially Recalled Batch',
    subtitle: 'Do not consume. Return it to the chemist and report it.'
  },
  UNDER_INVESTIGATION: {
    icon: ShieldAlert,
    title: 'Under Investigation',
    subtitle: 'This batch is not cleared. Verify with the manufacturer and authority.'
  },
  NOT_LISTED: {
    icon: ShieldCheck,
    title: 'Not Listed in Recall Database',
    subtitle: 'This batch is not in the recalled medicines database, but that does not prove authenticity.'
  }
};

const BatchVerify = () => {
  const [batchNumber, setBatchNumber] = useState('');
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const { scanning, result, performBatchVerify, clearResult } = useScanner();

  useEffect(() => {
    const prefill = location.state?.batchNumber || new URLSearchParams(location.search).get('batch') || '';
    if (prefill) setBatchNumber(prefill);
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!batchNumber.trim()) newErrors.batchNumber = 'Batch number is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      performBatchVerify(batchNumber);
    }
  };

  const verification = result?.data || result;
  const config = verification ? statusConfig[verification.status] || statusConfig.NOT_LISTED : null;
  const StatusIcon = config?.icon;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Batch <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Verification</span>
          </h1>
          <p className="text-text-secondary">Verify medicines using batch numbers and manufacturer information</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`p-8 rounded-3xl border-2 ${verification?.status === 'RECALLED' ? 'border-danger bg-danger/10' : verification?.status === 'UNDER_INVESTIGATION' ? 'border-warning bg-warning/10' : 'border-success bg-success/10'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-bg-primary/80 border border-border-color">
                  {StatusIcon && <StatusIcon size={32} className={verification?.status === 'RECALLED' ? 'text-danger' : verification?.status === 'UNDER_INVESTIGATION' ? 'text-warning' : 'text-success'} />}
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-text-primary">{config?.title}</p>
                  <p className="text-text-secondary mt-1">{config?.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-bg-primary/80 p-4 rounded-2xl border border-border-color">
                  <p className="text-xs uppercase tracking-wider text-text-secondary font-bold">Batch Number</p>
                  <p className="text-lg font-semibold text-text-primary mt-1">{verification?.batchNumber}</p>
                </div>
                <div className="bg-bg-primary/80 p-4 rounded-2xl border border-border-color">
                  <p className="text-xs uppercase tracking-wider text-text-secondary font-bold">Status</p>
                  <p className="text-lg font-semibold text-text-primary mt-1">{verification?.status}</p>
                </div>
                {verification?.medicine && (
                  <div className="bg-bg-primary/80 p-4 rounded-2xl border border-border-color md:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-text-secondary font-bold">Medicine</p>
                    <p className="text-lg font-semibold text-text-primary mt-1">{verification.medicine}</p>
                  </div>
                )}
                {verification?.manufacturer && (
                  <div className="bg-bg-primary/80 p-4 rounded-2xl border border-border-color md:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-text-secondary font-bold">Manufacturer</p>
                    <p className="text-lg font-semibold text-text-primary mt-1">{verification.manufacturer}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <p className="font-semibold">{verification?.message}</p>
                {verification?.safetyNote && <p className="text-sm mt-2 text-amber-100/90">{verification.safetyNote}</p>}
                {verification?.action && <p className="text-sm mt-2 text-amber-100/90">{verification.action}</p>}
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-6">
                <button
                  onClick={() => {
                    clearResult();
                    setBatchNumber('');
                    setErrors({});
                    navigate('/batch-verify', { replace: true });
                  }}
                  className="btn-primary flex-1"
                >
                  Verify Another Batch
                </button>
                <button
                  onClick={() => navigate('/nearby-chemist')}
                  className="flex-1 px-6 py-4 rounded-2xl bg-success text-white font-semibold hover:opacity-95 transition-all"
                >
                  Find Verified Chemist
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Info Alert */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 flex gap-3">
              <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-primary font-semibold mb-1">How to find batch number</p>
                <p className="text-primary/80 text-sm">
                  Look for "Batch No." or "Lot No." printed on the medicine packet. It's usually a combination of letters and
                  numbers.
                </p>
              </div>
            </div>

            {/* Batch Number Input */}
            <label className="block">
              <span className="text-text-secondary text-sm mb-2 block font-semibold">Batch Number *</span>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => {
                  setBatchNumber(e.target.value);
                  if (errors.batchNumber) setErrors((prev) => ({ ...prev, batchNumber: '' }));
                }}
                placeholder="e.g., BAY2024001 or 123456AB"
                className="input-field"
              />
              {errors.batchNumber && <p className="text-danger text-sm mt-2">{errors.batchNumber}</p>}
            </label>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={scanning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full text-lg py-4"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check size={20} />
                  Verify Now
                </span>
              )}
            </motion.button>

            {/* Loading State */}
            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-lg bg-bg-secondary border border-primary/30 space-y-4"
              >
                <p className="text-text-primary font-semibold">Verifying batch information...</p>
                <div className="w-full bg-bg-primary rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Help Text */}
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-color space-y-2">
              <p className="text-text-secondary text-sm font-semibold">💡 Tip:</p>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Not being listed here does not prove the medicine is genuine</li>
                <li>• Ask the chemist to show the invoice and manufacturer details</li>
                <li>• When in doubt, call CDSCO helpline 1800-180-3024</li>
              </ul>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default BatchVerify;
