import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const ScanResult = ({ result, onStartNew }) => {
  if (!result) return null;

  const isGenuine = result.result === 'GENUINE';
  const isFake = result.result === 'FAKE';
  const isSuspicious = result.result === 'SUSPICIOUS';
  const isRecalled = result.batchStatus === 'RECALLED';

  const getResultConfig = () => {
    if (isRecalled) {
      return {
        icon: ShieldAlert,
        bgColor: 'bg-danger/20',
        borderColor: 'border-danger',
        textColor: 'text-danger',
        title: '⛔ RECALLED BATCH DETECTED',
        subtitle: 'This batch has been officially recalled by drug authorities!',
      };
    }
    if (isGenuine) {
      return {
        icon: CheckCircle,
        bgColor: 'bg-success/20',
        borderColor: 'border-success',
        textColor: 'text-success',
        title: '✅ GENUINE MEDICINE VERIFIED',
        subtitle: 'Packaging analysis indicates this medicine is likely authentic.',
      };
    }
    if (isFake) {
      return {
        icon: XCircle,
        bgColor: 'bg-danger/20',
        borderColor: 'border-danger',
        textColor: 'text-danger',
        title: '❌ FAKE MEDICINE DETECTED',
        subtitle: 'Critical inconsistencies found in packaging analysis.',
      };
    }
    return {
      icon: AlertTriangle,
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      title: '⚠️ SUSPICIOUS MEDICINE',
      subtitle: 'Packaging shows signs of concern. Exercise extreme caution.',
    };
  };

  const config = getResultConfig();
  const Icon = config.icon;
  const details = result.medicineDetails || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Result Header */}
      <div className={`p-8 rounded-2xl border-2 ${config.borderColor} ${config.bgColor} relative overflow-hidden`}>
        <div className="flex items-center gap-4 mb-2 relative z-10">
          <Icon size={40} className={config.textColor} />
          <div>
            <p className={`text-2xl font-bold ${config.textColor}`}>{config.title}</p>
            <p className="text-text-secondary">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Chatbot Summary Bubble */}
      {result.summary && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4 items-start bg-bg-secondary p-6 rounded-2xl border-l-4 border-primary shadow-sm"
        >
          <div className="bg-primary/10 p-2 rounded-full mt-1">
            <Info size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">MediGuard AI Assistant</p>
            <p className="text-text-primary leading-relaxed italic text-lg font-medium">
              "{result.summary}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Batch Alert */}
      {result.batchNumber && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isRecalled ? 'bg-danger/10 border-danger text-danger' : 'bg-bg-secondary border-border-color text-text-secondary'
        }`}>
          <Info size={20} />
          <p className="font-medium">
            Batch <span className="font-bold text-text-primary">{result.batchNumber}</span>: 
            {isRecalled ? ' OFFICIALLY RECALLED' : ' NOT IN RECALL DATABASE (UNVERIFIED)'}
          </p>
        </div>
      )}

      {/* Detailed Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-glass p-4 rounded-xl border border-border-color">
          <p className="text-text-secondary text-sm mb-1 font-medium">Detected Name</p>
          <p className="text-lg font-bold text-text-primary">{details.name || 'Unknown'}</p>
        </div>

        <div className="card-glass p-4 rounded-xl border border-border-color">
          <p className="text-text-secondary text-sm mb-1 font-medium">Manufacturer</p>
          <p className="text-lg font-bold text-text-primary">{details.manufacturer || 'Unknown'}</p>
        </div>

        <div className="card-glass p-4 rounded-xl border border-border-color">
          <p className="text-text-secondary text-sm mb-1 font-medium">AI Confidence</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
              <div
                className={`h-full ${isGenuine ? 'bg-success' : isFake ? 'bg-danger' : 'bg-warning'}`}
                style={{ width: `${result.confidence || 0}%` }}
              />
            </div>
            <p className="text-lg font-bold text-text-primary">{result.confidence || 0}%</p>
          </div>
        </div>

        <div className="card-glass p-4 rounded-xl border border-border-color">
          <p className="text-text-secondary text-sm mb-1 font-medium">Category</p>
          <p className="text-lg font-bold text-text-primary capitalize">{details.category || 'Unknown'}</p>
        </div>
      </div>

      {/* Clinical Information (New Section) */}
      {(details.description || details.sideEffects?.length > 0 || details.dosage || details.storage) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-3">
              <Info size={20} className="text-primary" /> Clinical Overview
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {details.description || 'No description available for this medicine.'}
            </p>
          </div>
          
          {details.sideEffects?.length > 0 && (
            <div className="card-glass p-5 rounded-xl border border-border-color">
              <p className="text-text-secondary text-xs mb-2 font-bold uppercase tracking-wider">Potential Side Effects</p>
              <div className="flex flex-wrap gap-2">
                {details.sideEffects.map((effect, i) => (
                  <span key={i} className="bg-bg-primary px-3 py-1 rounded-full text-sm text-text-primary border border-border-color">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(details.dosage || details.storage) && (
            <div className="card-glass p-5 rounded-xl border border-border-color space-y-4">
              {details.dosage && (
                <div>
                  <p className="text-text-secondary text-xs mb-1 font-bold uppercase tracking-wider">Typical Dosage</p>
                  <p className="text-text-primary font-medium">{details.dosage}</p>
                </div>
              )}
              {details.storage && (
                <div>
                  <p className="text-text-secondary text-xs mb-1 font-bold uppercase tracking-wider">Storage Instructions</p>
                  <p className="text-text-primary font-medium">{details.storage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Reasons */}
      {result.reasons && result.reasons.length > 0 && (
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" /> Forensic Packaging Analysis
          </h3>
          <ul className="space-y-3">
            {result.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-success/5 p-6 rounded-2xl border border-success/20 space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <CheckCircle size={20} className="text-success" /> Quality Assurance Advice
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {result.recommendations.map((rec, idx) => (
              <p key={idx} className="text-text-primary font-medium bg-bg-primary/50 p-3 rounded-lg border border-border-color flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button onClick={onStartNew} className="btn-primary flex-1">
          Scan Another Medicine
        </button>
        {(isFake || isSuspicious || isRecalled) && (
          <button className="btn-secondary bg-danger text-white border-none flex-1">
            Report Counterfeit
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ScanResult;
