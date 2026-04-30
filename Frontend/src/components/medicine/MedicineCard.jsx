import React from 'react';
import { Pill, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicineCard = ({ medicine, onDetails }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={() => onDetails?.(medicine)}
      className="card cursor-pointer space-y-4 group"
    >
      {/* Medicine Image Placeholder */}
      <div className="relative w-full h-40 bg-bg-primary rounded-lg border border-border-color flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-smooth">
        <Pill size={48} className="text-primary/30" />
      </div>

      {/* Medicine Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
          {medicine.name}
        </h3>
        <p className="text-text-secondary text-sm">{medicine.manufacturer}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold capitalize">
            {medicine.category}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              medicine.status === 'genuine'
                ? 'bg-success/20 text-success'
                : medicine.status === 'fake'
                ? 'bg-danger/20 text-danger'
                : 'bg-warning/20 text-warning'
            }`}
          >
            {medicine.status}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="pt-2 border-t border-border-color flex justify-between items-center">
        <p className="text-text-secondary text-sm">MRP</p>
        <p className="text-lg font-bold text-primary">₹{medicine.mrp}</p>
      </div>

      {/* Action */}
      <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-smooth text-sm font-semibold">
        <Info size={16} />
        View Details
      </button>
    </motion.div>
  );
};

export default MedicineCard;
