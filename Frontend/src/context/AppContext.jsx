import React, { createContext, useState, useCallback, useEffect } from 'react';
import { SCAN_HISTORY, ALERTS, REPORTS } from '../utils/mockData.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [scanHistory, setScanHistory] = useState(() => {
    const saved = localStorage.getItem('scanHistory');
    return saved ? JSON.parse(saved) : SCAN_HISTORY;
  });

  const [userLocation, setUserLocation] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState(() => {
    const saved = localStorage.getItem('activeAlerts');
    return saved ? JSON.parse(saved) : ALERTS.filter((a) => !a.read);
  });

  const [recentReports, setRecentReports] = useState(() => {
    const saved = localStorage.getItem('recentReports');
    return saved ? JSON.parse(saved) : REPORTS;
  });

  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved
      ? JSON.parse(saved)
      : {
          theme: 'dark',
          notifications: true,
          location: 'Bangalore',
        };
  });

  // Persist scanHistory
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  // Persist activeAlerts
  useEffect(() => {
    localStorage.setItem('activeAlerts', JSON.stringify(activeAlerts));
  }, [activeAlerts]);

  // Persist recentReports
  useEffect(() => {
    localStorage.setItem('recentReports', JSON.stringify(recentReports));
  }, [recentReports]);

  // Persist userPreferences
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const addScanToHistory = useCallback((scan) => {
    setScanHistory((prev) => [scan, ...prev].slice(0, 20));
  }, []);

  const clearScanHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  const markAlertAsRead = useCallback((alertId) => {
    setActiveAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert)));
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setActiveAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const addReport = useCallback((report) => {
    setRecentReports((prev) => [report, ...prev]);
  }, []);

  const updateUserLocation = useCallback((location) => {
    setUserLocation(location);
  }, []);

  const updateUserPreferences = useCallback((preferences) => {
    setUserPreferences((prev) => ({ ...prev, ...preferences }));
  }, []);

  const value = {
    // State
    scanHistory,
    userLocation,
    activeAlerts,
    recentReports,
    userPreferences,

    // Methods
    addScanToHistory,
    clearScanHistory,
    markAlertAsRead,
    dismissAlert,
    addReport,
    updateUserLocation,
    updateUserPreferences,
  };

  console.log('📱 AppContext initialized with:', {
    scanHistoryCount: scanHistory.length,
    activeAlertsCount: activeAlerts.length,
    recentReportsCount: recentReports.length,
  });

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
