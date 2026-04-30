import { useState, useCallback } from 'react';
import { scanMedicine, verifyBatch, getScanHistory } from '../services/scannerService.js';

export const useScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const performScan = useCallback(async (imageFile, batchNumber = '') => {
    setScanning(true);
    setError(null);
    try {
      const response = await scanMedicine(imageFile, batchNumber);
      setResult(response.data);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan medicine. Please try again.');
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  }, []);

  const performBatchVerify = useCallback(async (batchNumber, manufacturer, category) => {
    setScanning(true);
    setError(null);
    try {
      const response = await verifyBatch(batchNumber, manufacturer, category);
      setResult(response.data);
      return response;
    } catch (err) {
      setError('Failed to verify batch. Please try again.');
      console.error('Verify error:', err);
    } finally {
      setScanning(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getScanHistory();
      setHistory(response.data);
      return response;
    } catch (err) {
      setError('Failed to load history.');
      console.error('History error:', err);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    scanning,
    result,
    history,
    error,
    performScan,
    performBatchVerify,
    fetchHistory,
    clearResult,
  };
};
