import React, { useState, useCallback } from 'react';
import { Upload, X, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ImageSection = ({ onAnalyze, isAnalyzing, hasAnalyzed }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
          isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border-color bg-bg-secondary hover:border-primary/50'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Medicine" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setPreview(null); setSelectedFile(null); }}
              className="absolute top-4 right-4 p-2 bg-danger rounded-xl text-white shadow-xl hover:scale-110 transition-transform"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center gap-4 cursor-pointer p-8 text-center w-full h-full justify-center">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileSelect(e.target.files[0])} 
            />
            <div className="p-5 rounded-2xl bg-primary/10 text-primary">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">Upload Medicine</p>
              <p className="text-sm text-text-secondary">Drag and drop or click to browse</p>
            </div>
            <div className="flex gap-4 text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-2">
              <span>JPG, PNG, WEBP</span>
              <span>•</span>
              <span>MAX 20MB</span>
            </div>
          </label>
        )}
      </div>

      <button
        onClick={() => onAnalyze(selectedFile)}
        disabled={!selectedFile || isAnalyzing}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
          !selectedFile || isAnalyzing
            ? 'bg-bg-secondary text-text-secondary cursor-not-allowed'
            : 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            {hasAnalyzed ? 'Re-analyze' : 'Analyze Medicine'}
          </>
        )}
      </button>

      {hasAnalyzed && selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center"
        >
          <p className="text-sm text-primary font-medium">
            You have uploaded a new image. Click Analyze to start a fresh analysis.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ImageSection;
