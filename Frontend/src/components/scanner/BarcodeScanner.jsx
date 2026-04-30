import React, { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

const BarcodeScanner = ({ onScan, loading = false }) => {
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleManualInput = (e) => {
    const value = e.target.value;
    setManualInput(value);
    setError(null);
  };

  const handleScan = () => {
    if (!manualInput.trim()) {
      setError('Please enter a barcode number');
      return;
    }

    if (manualInput.length < 8 || manualInput.length > 14) {
      setError('Barcode should be between 8-14 digits');
      return;
    }

    onScan(manualInput);
    setManualInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Info */}
      <div className="p-6 rounded-lg bg-bg-secondary border border-primary/30">
        <div className="flex gap-3">
          <AlertCircle className="text-primary flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-semibold text-primary mb-2">Camera Access Required</p>
            <p className="text-text-secondary text-sm">
              MediGuard needs permission to access your device camera to scan barcodes. Your privacy is
              important to us — we don't store camera data.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Input */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-text-secondary text-sm mb-2 block">
            Enter Barcode Number Manually
          </span>
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={handleManualInput}
            onKeyPress={handleKeyPress}
            placeholder="Enter 8-14 digit barcode..."
            disabled={loading}
            className="input-field"
          />
        </label>

        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={loading || !manualInput.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Scanning...' : 'Scan Barcode'}
        </button>
      </div>

      {/* Camera Placeholder */}
      <div className="relative w-full aspect-square bg-bg-secondary rounded-lg border-2 border-dashed border-border-color overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto border-4 border-primary rounded-lg flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 border-2 border-primary"></div>
            </div>
            <div>
              <p className="text-text-secondary">Camera feed would appear here</p>
              <p className="text-text-secondary text-sm mt-1">Use manual input above for demo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Format Info */}
      <div className="p-4 rounded-lg bg-bg-secondary border border-border-color space-y-2">
        <p className="text-text-secondary text-sm font-semibold">About Barcodes:</p>
        <ul className="text-text-secondary text-sm space-y-1">
          <li>• EAN-13: Standard barcode used in India (13 digits)</li>
          <li>• UPC-A: Universal barcode (12 digits)</li>
          <li>• Standard barcodes are unique per medicine batch</li>
          <li>• Counterfeit barcodes often have printing errors</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;
