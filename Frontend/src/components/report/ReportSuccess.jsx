import React from 'react';
import { CheckCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ReportSuccess = ({ caseId, onStartNew }) => {
  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(caseId);
    toast.success('Case ID copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Success Animation */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-block"
        >
          <div className="w-24 h-24 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
            <CheckCircle size={48} className="text-success animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8 space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-success"
        >
          Report Submitted Successfully!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary text-lg"
        >
          Thank you for helping protect India's medicine supply
        </motion.p>
      </div>

      {/* Case ID Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card mb-8 space-y-4"
      >
        <div className="space-y-2">
          <p className="text-text-secondary text-sm">Your Case ID</p>
          <div className="flex items-center gap-3 bg-bg-primary p-4 rounded-lg border-2 border-primary">
            <p className="text-2xl font-mono font-bold text-primary flex-1">{caseId}</p>
            <button
              onClick={handleCopyCaseId}
              className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-smooth"
              title="Copy to clipboard"
            >
              <Copy size={20} />
            </button>
          </div>
          <p className="text-text-secondary text-sm">Save this ID to track your report status</p>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mb-8 space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary">What Happens Next?</h3>
        <div className="space-y-3">
          {[
            {
              number: 1,
              title: 'Verification',
              description:
                'Our team and CDSCO authorities will verify your report within 24-48 hours',
            },
            {
              number: 2,
              title: 'Investigation',
              description:
                'A full investigation will be conducted. This typically takes 5-7 business days',
            },
            {
              number: 3,
              title: 'Action',
              description:
                'If confirmed, the batch will be recalled and the chemist may face legal action',
            },
            {
              number: 4,
              title: 'Update',
              description:
                'You will receive updates on your case. Check back using your Case ID',
            },
          ].map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                {step.number}
              </div>
              <div>
                <p className="font-semibold text-text-primary">{step.title}</p>
                <p className="text-text-secondary text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-lg bg-primary/10 border border-primary/30 mb-8"
      >
        <p className="text-text-secondary text-sm">
          <span className="text-primary font-semibold">Important:</span> Your report has been forwarded to CDSCO (Central Drugs
          Standard Control Organisation) and your State Drug Authority. All information will be kept
          confidential.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 justify-center"
      >
        <button onClick={onStartNew} className="btn-primary">
          Report Another Fake
        </button>
        <button className="btn-outline">
          Go to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ReportSuccess;
