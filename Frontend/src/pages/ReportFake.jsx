import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReportForm from '../components/report/ReportForm.jsx';
import ReportSuccess from '../components/report/ReportSuccess.jsx';
import { useReport } from '../hooks/useReport.js';

const ReportFake = () => {
  const { submitting, success, caseId, submitFakeReport, resetForm } = useReport();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    const response = await submitFakeReport(formData);
    if (response?.success) {
      setShowSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Report <span className="text-danger">Fake Medicine</span>
          </h1>
          <p className="text-text-secondary">
            Help us protect India by reporting counterfeit medicines you've encountered
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {showSuccess && caseId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ReportSuccess
              caseId={caseId}
              onStartNew={() => {
                setShowSuccess(false);
                resetForm();
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ReportForm onSubmit={handleSubmit} loading={submitting} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportFake;
