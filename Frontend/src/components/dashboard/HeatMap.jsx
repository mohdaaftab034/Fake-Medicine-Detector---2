import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const HeatMap = () => {
  // Mock data for states with fake medicines
  const stateData = [
    { name: 'Maharashtra', count: 142, percentage: 95 },
    { name: 'Delhi', count: 98, percentage: 85 },
    { name: 'Karnataka', count: 76, percentage: 70 },
    { name: 'Tamil Nadu', count: 65, percentage: 60 },
    { name: 'West Bengal', count: 54, percentage: 50 },
    { name: 'Uttar Pradesh', count: 48, percentage: 45 },
    { name: 'Gujarat', count: 42, percentage: 40 },
    { name: 'Punjab', count: 38, percentage: 35 },
  ];

  const maxCount = useMemo(() => Math.max(...stateData.map((s) => s.count)), []);

  const getHeatColor = (percentage) => {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    if (percentage >= 50) return 'bg-primary';
    return 'bg-primary/50';
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="text-primary" size={24} />
        <h3 className="text-lg font-semibold text-primary">Fake Medicine Heatmap - India</h3>
      </div>

      {/* Map Placeholder */}
      <div className="relative w-full h-64 bg-bg-primary rounded-lg border border-border-color overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin size={48} className="mx-auto text-text-secondary/30" />
          <p className="text-text-secondary">Interactive India map with hotspots would display here</p>
        </div>
      </div>

      {/* State-wise Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-text-primary">Top Affected States</h4>
        {stateData.map((state, idx) => (
          <motion.div
            key={state.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-text-secondary text-sm">{state.name}</p>
              <p className="text-text-primary font-semibold">{state.count} cases</p>
            </div>
            <div className="relative h-3 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getHeatColor(state.percentage)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${state.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 + 0.2 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-color">
        {[
          { label: 'Critical', color: 'bg-danger', range: '90%+' },
          { label: 'High', color: 'bg-warning', range: '70-90%' },
          { label: 'Medium', color: 'bg-primary', range: '50-70%' },
          { label: 'Low', color: 'bg-primary/50', range: '<50%' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color}`}></div>
            <div>
              <p className="text-text-primary text-xs font-semibold">{item.label}</p>
              <p className="text-text-secondary text-xs">{item.range}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatMap;
