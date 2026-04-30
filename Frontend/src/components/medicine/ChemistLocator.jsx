import React, { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHEMISTS } from '../../utils/mockData.js';

const ChemistLocator = ({ nearbyChemists = CHEMISTS, onSelectChemist }) => {
  const [filteredChemists, setFilteredChemists] = useState(nearbyChemists);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);

  useEffect(() => {
    let filtered = nearbyChemists;

    if (filterVerifiedOnly) {
      filtered = filtered.filter((c) => c.verified);
    }

    if (filterOpenOnly) {
      filtered = filtered.filter((c) => c.open);
    }

    filtered.sort((a, b) => a.distance - b.distance);
    setFilteredChemists(filtered);
  }, [nearbyChemists, filterVerifiedOnly, filterOpenOnly]);

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <div className="relative w-full h-96 bg-bg-primary rounded-lg border-2 border-border-color overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin size={48} className="mx-auto text-text-secondary/30" />
          <p className="text-text-secondary">Google Maps would display nearby chemists</p>
          <p className="text-text-secondary text-sm">Use list below for demo</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-secondary border-border-color accent-primary cursor-pointer"
          />
          <span className="text-text-secondary text-sm">Verified Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterOpenOnly}
            onChange={(e) => setFilterOpenOnly(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-secondary border-border-color accent-primary cursor-pointer"
          />
          <span className="text-text-secondary text-sm">Open Now</span>
        </label>
      </div>

      {/* Chemist List */}
      <div className="space-y-3">
        {filteredChemists.map((chemist, idx) => (
          <motion.div
            key={chemist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectChemist?.(chemist)}
            className="card cursor-pointer space-y-3 hover:border-primary/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{chemist.name}</h3>
                  {chemist.verified && (
                    <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {chemist.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold">{chemist.distance} km</p>
                <p className={`text-sm ${chemist.open ? 'text-success' : 'text-danger'}`}>
                  {chemist.open ? '🟢 Open' : '🔴 Closed'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-color">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="font-semibold text-text-primary">{chemist.rating}</span>
                </div>
                <p className="text-text-secondary text-xs">Rating</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${chemist.phone}`;
                }}
                className="flex items-center justify-center gap-1 rounded-lg hover:bg-bg-primary transition-smooth"
              >
                <Phone size={14} className="text-primary" />
                <span className="text-primary text-sm font-semibold">Call</span>
              </button>
              <div className="text-center">
                <p className="text-text-primary font-semibold text-sm">Verified</p>
                <p className="text-text-secondary text-xs">{chemist.verified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredChemists.length === 0 && (
        <div className="card text-center py-8">
          <MapPin size={32} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No chemists match your filters</p>
        </div>
      )}
    </div>
  );
};

export default ChemistLocator;
