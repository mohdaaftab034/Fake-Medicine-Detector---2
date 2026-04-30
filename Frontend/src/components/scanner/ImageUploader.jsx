import React, { useState, useCallback } from 'react';
import { Upload, X, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { validateImageFile } from '../../utils/validators.js';

const ImageUploader = ({ onUpload, loading = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file) => {
    setError(null);

    if (!validateImageFile(file)) {
      setError('Please upload a valid image under 20MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(2)); // KB
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const clearPreview = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setError(null);
  }, []);

  const handleScanClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
          <button
            onClick={clearPreview}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-xl bg-danger/80 hover:bg-danger text-white transition-all backdrop-blur-md disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color flex justify-between items-center">
          <div>
            <p className="text-text-primary font-bold truncate max-w-[200px]">{fileName}</p>
            <p className="text-text-secondary text-sm">{fileSize} KB</p>
          </div>
          {!loading && (
            <button
              onClick={handleScanClick}
              className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
            >
              <Sparkles size={18} />
              Start AI Scan
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border-color hover:border-primary/50 hover:bg-bg-secondary'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-4">
          <motion.div
            animate={{ y: isDragging ? -10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-5 rounded-2xl bg-primary/10 text-primary">
              <Upload size={40} />
            </div>
          </motion.div>
          <div>
            <p className="text-xl font-bold text-text-primary">
              Upload Medicine Image
            </p>
            <p className="text-text-secondary mt-1">
              Drag and drop or click to browse
            </p>
          </div>
          <div className="flex justify-center gap-4 text-xs text-text-secondary">
            <span>All Image Formats (JPG, JPEG, PNG, etc.)</span>
            <span>•</span>
            <span>Max 20MB</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageUploader;
