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
    <div className="mg-root">
      <section className="mg-hero py-12 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="mg-badge mg-badge--red mb-4">
              <span className="mg-badge__dot" />
              Counterfeit Reporting
            </span>
            <h1 className="mg-hero__headline text-4xl md:text-6xl mb-4">Report Suspected Fake</h1>
            <p className="mg-hero__sub mx-auto">Help protect public health by reporting counterfeit, substandard, or expired medicines. Your reports are shared directly with drug control authorities.</p>
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
        <div className="max-w-4xl mx-auto">
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
              className="mg-card p-0 overflow-hidden"
            >
              <ReportForm onSubmit={handleSubmit} loading={submitting} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFake;
