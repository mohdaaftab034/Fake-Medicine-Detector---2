import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard.jsx';
import HeatMap from '../components/dashboard/HeatMap.jsx';
import RecentReports from '../components/dashboard/RecentReports.jsx';
import { DASHBOARD_STATS } from '../utils/mockData.js';

const Dashboard = () => {
  return (
    <div className="mg-root">
      <section className="mg-hero py-12 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="mg-badge mg-badge--accent mb-4">
              <span className="mg-badge__dot" />
              Administrative Overview
            </span>
            <h1 className="mg-hero__headline text-4xl md:text-6xl mb-4">Control Dashboard</h1>
            <p className="mg-hero__sub mx-auto">Real-time safety metrics, counterfeit detection heatmaps, and regulatory monitoring.</p>
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatsCard
            icon={AlertTriangle}
            title="Monthly Reports"
            value={DASHBOARD_STATS.totalReportsThisMonth}
            trend="+24%"
            color="danger"
          />
          <StatsCard
            icon={ShieldCheck}
            title="Fake Detected"
            value={DASHBOARD_STATS.fakeMedicinesDetected}
            trend="+18%"
            color="primary"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Blacklisted"
            value={DASHBOARD_STATS.chemistsBlacklisted}
            trend="+5"
            color="warning"
          />
          <StatsCard
            icon={MapPin}
            title="Alert Zones"
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
          className="mb-12"
        >
          <div className="mg-card p-0 overflow-hidden border-line shadow-2xl">
            <HeatMap />
          </div>
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
          className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Top Faked Medicines */}
          <div className="mg-card p-8">
            <h3 className="text-xl font-bold text-text-hi flex items-center gap-3 mb-6">
              <BarChart3 size={24} className="text-accent" />
              Counterfeit Trends
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Insulin', count: 342 },
                { name: 'Aspirin', count: 285 },
                { name: 'Paracetamol', count: 267 },
                { name: 'Cough Syrup', count: 198 },
                { name: 'Vitamin D', count: 156 },
              ].map((medicine, idx) => (
                <div key={medicine.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-hi">{medicine.name}</span>
                    <span className="text-xs font-black text-accent">{medicine.count}</span>
                  </div>
                  <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red to-amber"
                      initial={{ width: 0 }}
                      animate={{ width: `${(medicine.count / 342) * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mg-card p-8">
            <h3 className="text-xl font-bold text-text-hi mb-6">Aggregate Safety Data</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Total Scans', value: DASHBOARD_STATS.totalScans, bg: 'bg-accent-glow', color: 'text-accent' },
                { label: 'Genuine Validated', value: Math.floor(DASHBOARD_STATS.totalScans * 0.75), bg: 'bg-green-dim', color: 'text-green' },
                { label: 'Confirmed Fakes', value: Math.floor(DASHBOARD_STATS.totalScans * 0.15), bg: 'bg-red-dim', color: 'text-red' },
                { label: 'Under Investigation', value: Math.floor(DASHBOARD_STATS.totalScans * 0.1), bg: 'bg-amber/5', color: 'text-amber' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-5 rounded-2xl bg-bg-2 border border-line shadow-sm">
                  <span className="text-sm font-bold text-text-md">{stat.label}</span>
                  <span className={`text-lg font-black ${stat.color}`}>{stat.value.toLocaleString()}</span>
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
