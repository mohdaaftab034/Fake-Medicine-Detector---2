import { useState, useCallback } from 'react';
import { submitReport, uploadReportEvidence } from '../services/reportService.js';

export const useReport = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caseId, setCaseId] = useState(null);

  const submitFakeReport = useCallback(async (reportData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await submitReport(reportData);
      setCaseId(response.data.caseId);
      setSuccess(true);
      return response;
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Report submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const uploadEvidence = useCallback(async (file) => {
    setUploadingEvidence(true);
    setError(null);

    try {
      const response = await uploadReportEvidence(file);
      return response;
    } catch (err) {
      setError('Failed to upload evidence. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploadingEvidence(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setCaseId(null);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    submitting,
    uploadingEvidence,
    error,
    success,
    caseId,
    submitFakeReport,
    uploadEvidence,
    resetForm,
  };
};
