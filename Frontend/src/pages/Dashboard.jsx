import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard.jsx';
import HeatMap from '../components/dashboard/HeatMap.jsx';
import RecentReports from '../components/dashboard/RecentReports.jsx';
import { DASHBOARD_STATS } from '../utils/mockData.js';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dashboard</span>
          </h1>
          <p className="text-text-secondary">Real-time fake medicine detection statistics and alerts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            icon={AlertTriangle}
            title="Reports This Month"
            value={DASHBOARD_STATS.totalReportsThisMonth}
            trend="+24%"
            color="danger"
          />
          <StatsCard
            icon={ShieldCheck}
            title="Fake Medicines Detected"
            value={DASHBOARD_STATS.fakeMedicinesDetected}
            trend="+18%"
            color="primary"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Chemists Blacklisted"
            value={DASHBOARD_STATS.chemistsBlacklisted}
            trend="+5"
            color="warning"
          />
          <StatsCard
            icon={MapPin}
            title="Areas on Alert"
            value={DASHBOARD_STATS.areasOnAlert}
            trend="+3"
            color="success"
          />
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <HeatMap />
        </motion.div>

        {/* Reports Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-8"
        >
          <RecentReports />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Top Faked Medicines */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <BarChart3 size={20} />
              Top 5 Most Counterfeited Medicines
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Insulin', count: 342 },
                { name: 'Aspirin', count: 285 },
                { name: 'Paracetamol', count: 267 },
                { name: 'Cough Syrup', count: 198 },
                { name: 'Vitamin D', count: 156 },
              ].map((medicine, idx) => (
                <div key={medicine.name} className="flex items-center justify-between">
                  <span className="text-text-secondary">{medicine.name}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-danger to-warning"
                        initial={{ width: 0 }}
                        animate={{ width: `${(medicine.count / 342) * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                      />
                    </div>
                    <span className="text-text-primary font-semibold w-12 text-right">{medicine.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-primary">Quick Statistics</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Scans', value: DASHBOARD_STATS.totalScans },
                { label: 'Genuine Medicines', value: Math.floor(DASHBOARD_STATS.totalScans * 0.75) },
                { label: 'Fake Medicines', value: Math.floor(DASHBOARD_STATS.totalScans * 0.15) },
                { label: 'Suspicious', value: Math.floor(DASHBOARD_STATS.totalScans * 0.1) },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg bg-bg-primary">
                  <span className="text-text-secondary">{stat.label}</span>
                  <span className="text-text-primary font-semibold">{stat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
