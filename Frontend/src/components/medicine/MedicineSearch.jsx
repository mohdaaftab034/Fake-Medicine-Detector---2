import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { debounce } from '../../utils/helpers.js';

const MedicineSearch = ({ onSearch, onClear, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-text-secondary pointer-events-none" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search medicines by name or manufacturer..."
          disabled={isLoading}
          className="input-field pl-12"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-12 top-3.5"
        >
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      )}
    </div>
  );
};

export default MedicineSearch;
