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
    <div className="mg-root">
      <section className="mg-hero py-16 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="mg-badge mg-badge--green mb-4">
              <span className="mg-badge__dot" />
              Official Database Sync
            </span>
            <h1 className="mg-hero__headline text-4xl md:text-6xl mb-4">Batch Verification</h1>
            <p className="mg-hero__sub mx-auto">Verify medicines against manufacturer records and CDSCO recall databases.</p>
          </div>
        </div>
      </section>

      <div className="mg-container py-16">
        <div className="max-w-3xl mx-auto">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className={`p-8 rounded-[2rem] border-2 shadow-xl ${
                verification?.status === 'RECALLED' 
                ? 'border-red bg-red-dim' 
                : verification?.status === 'UNDER_INVESTIGATION' 
                ? 'border-amber bg-amber/5' 
                : 'border-green bg-green-dim'
              }`}>
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                  <div className={`p-4 rounded-2xl ${
                    verification?.status === 'RECALLED' ? 'bg-red text-white' : 
                    verification?.status === 'UNDER_INVESTIGATION' ? 'bg-amber text-white' : 
                    'bg-green text-white'
                  }`}>
                    {StatusIcon && <StatusIcon size={40} />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-hi mb-2">{config?.title}</h2>
                    <p className="text-text-md leading-relaxed">{config?.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-bg-1 p-5 rounded-2xl border border-line shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-text-lo font-bold mb-1">Batch Number</p>
                    <p className="text-xl font-bold text-text-hi">{verification?.batchNumber}</p>
                  </div>
                  <div className="bg-bg-1 p-5 rounded-2xl border border-line shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-text-lo font-bold mb-1">Current Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        verification?.status === 'RECALLED' ? 'bg-red' : 
                        verification?.status === 'UNDER_INVESTIGATION' ? 'bg-amber' : 
                        'bg-green'
                      }`} />
                      <p className="text-xl font-bold text-text-hi">{verification?.status}</p>
                    </div>
                  </div>
                  {verification?.medicine && (
                    <div className="bg-bg-1 p-5 rounded-2xl border border-line md:col-span-2 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest text-text-lo font-bold mb-1">Medicine Name</p>
                      <p className="text-xl font-bold text-text-hi">{verification.medicine}</p>
                    </div>
                  )}
                  {verification?.manufacturer && (
                    <div className="bg-bg-1 p-5 rounded-2xl border border-line md:col-span-2 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest text-text-lo font-bold mb-1">Manufacturer</p>
                      <p className="text-xl font-bold text-text-hi">{verification.manufacturer}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-bg-0/50 border border-line/50 backdrop-blur-sm">
                  <p className="text-text-hi font-bold text-lg mb-2">{verification?.message}</p>
                  {verification?.safetyNote && <p className="text-text-md text-sm leading-relaxed">{verification.safetyNote}</p>}
                  {verification?.action && (
                    <div className="mt-4 p-3 rounded-lg bg-accent-glow border border-accent/20 text-accent font-semibold text-sm inline-block">
                      Action Required: {verification.action}
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-line/20">
                  <button
                    onClick={() => {
                      clearResult();
                      setBatchNumber('');
                      setErrors({});
                      navigate('/batch-verify', { replace: true });
                    }}
                    className="mg-btn mg-btn--primary flex-1 justify-center py-4"
                  >
                    Verify Another Batch
                  </button>
                  <button
                    onClick={() => navigate('/nearby-chemist')}
                    className="mg-btn mg-btn--ghost flex-1 justify-center py-4"
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
              className="space-y-8 mg-card p-10"
            >
              <div className="p-5 rounded-2xl bg-accent-glow border border-accent/20 flex gap-4">
                <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="text-text-hi font-bold mb-1">Finding the batch number</p>
                  <p className="text-text-md text-sm leading-relaxed">
                    Look for "Batch No." or "Lot No." printed on the medicine strip or box. It's usually near the expiry date.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-text-hi uppercase tracking-widest">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => {
                    setBatchNumber(e.target.value);
                    if (errors.batchNumber) setErrors((prev) => ({ ...prev, batchNumber: '' }));
                  }}
                  placeholder="e.g., BAY2024001"
                  className="input-field py-4 px-6 text-lg"
                />
                {errors.batchNumber && <p className="text-red text-sm font-medium mt-1">{errors.batchNumber}</p>}
              </div>

              <button
                type="submit"
                disabled={scanning}
                className="mg-btn mg-btn--primary w-full justify-center text-lg py-5 shadow-glow"
              >
                {scanning ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-bg-0 border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <ShieldCheck size={22} />
                    Verify Now
                  </span>
                )}
              </button>

              <div className="p-6 rounded-2xl bg-bg-2 border border-line space-y-3">
                <p className="text-text-hi font-bold text-sm">Important Safety Notice:</p>
                <ul className="text-text-md text-sm space-y-2">
                  <li className="flex gap-2"><span>•</span> Not being in the recall list doesn't guarantee the medicine is genuine.</li>
                  <li className="flex gap-2"><span>•</span> Always purchase from licensed and government-verified chemists.</li>
                  <li className="flex gap-2"><span>•</span> In case of doubt, report immediately using our "Report Fake" tool.</li>
                </ul>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchVerify;
