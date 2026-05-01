import React, { useMemo, useState, useEffect } from 'react';
import api from '../services/api.js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ImageSection from '../components/scanner/ImageSection';
import ChatSection from '../components/scanner/ChatSection';
import { scanMedicine, chatFollowUp } from '../services/scannerService';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, ShieldAlert, ArrowRight, Info } from 'lucide-react';

const ANALYSIS_DISCLAIMER = 'AI packaging analysis cannot confirm if medicine contents are genuine. Combine this with batch verification and purchase from verified chemists for maximum safety.';

const Scanner = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // States
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mediguard_scan_history_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(() => {
    const saved = localStorage.getItem('mediguard_scan_history_messages');
    if (saved) {
      const msgs = JSON.parse(saved);
      return msgs.some(m => m.type === 'full_report');
    }
    return false;
  });
  const [userLocation, setUserLocation] = useState(null);
  const [currentScanId, setCurrentScanId] = useState(() => {
    const saved = localStorage.getItem('mediguard_scan_history_messages');
    if (saved) {
      const msgs = JSON.parse(saved);
      const lastReport = [...msgs].reverse().find(m => m.type === 'full_report');
      return lastReport?.scanId || null;
    }
    return null;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('mediguard_scan_history_messages', JSON.stringify(messages));
  }, [messages]);

  // Location detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setMessages([]);
      localStorage.removeItem('mediguard_scan_history_messages');
      setCurrentScanId(null);
      setPipelineComplete(false);
      setCurrentStep(0);
    }
  };

  const handleAnalyze = async (file) => {
    if (!file) return toast.error('Please upload a medicine image first');

    setIsAnalyzing(true);
    setCurrentStep(1);
    setStepResults({});
    setPipelineComplete(false);

    // Reset chat for new image analysis
    const pipelineMsg = {
      id: Date.now(),
      role: 'ai',
      type: 'pipeline_progress',
      content: 'Starting complete medicine analysis...',
      timestamp: new Date()
    };

    setMessages([pipelineMsg]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('medicineImage', file);
      if (userLocation) {
        formData.append('lat', userLocation.lat);
        formData.append('lng', userLocation.lng);
      }

      // Simulate step progress while UI runs
      const stepIntervals = [
        setTimeout(() => setCurrentStep(2), 2500),
        setTimeout(() => setCurrentStep(3), 4500),
        setTimeout(() => setCurrentStep(4), 6500)
      ];

      const response = await scanMedicine(file, userLocation?.lat, userLocation?.lng);

      // Clear timeouts if API returns faster
      stepIntervals.forEach(clearTimeout);

      const { pipeline, scanId } = response.data;
      setCurrentScanId(scanId);
      
      // Update step results
      setStepResults({
        1: {
          summary: `${pipeline.step1_packaging.status} — ${pipeline.step1_packaging.confidence}% confidence`,
          badge: pipeline.step1_packaging.status === 'GENUINE' ? 'Professional' : pipeline.step1_packaging.status,
          alert: pipeline.step1_packaging.status === 'FAKE'
        },
        2: {
          summary: pipeline.step2_batch.status === 'RECALLED' 
            ? `⚠️ RECALLED — ${pipeline.step2_batch.recallReason?.substring(0, 50)}...` 
            : pipeline.step2_batch.status === 'NOT_DETECTED'
            ? 'Batch not visible in image'
            : 'Not in recalled list',
          badge: pipeline.step2_batch.status === 'RECALLED' ? 'RECALLED' 
            : pipeline.step2_batch.status === 'NOT_DETECTED' ? 'Not Detected'
            : 'Clear',
          alert: pipeline.step2_batch.status === 'RECALLED'
        },
        3: {
          summary: pipeline.step3_medicineDb.found 
            ? `Found in ${pipeline.step3_medicineDb.source}`
            : 'Not found in database',
          badge: pipeline.step3_medicineDb.found ? 'Found' : 'Not Found',
          alert: false
        },
        4: {
          summary: pipeline.step4_chemists.length > 0
            ? `${pipeline.step4_chemists.length} verified chemist(s) nearby`
            : 'No verified chemists found nearby',
          badge: pipeline.step4_chemists.length > 0 ? `${pipeline.step4_chemists.length} Found` : 'None',
          alert: false
        }
      });

      setCurrentStep(5); // all done
      setPipelineComplete(true);

      // Add full report message
      setTimeout(() => {
        setMessages(prev => {
          // Replace the last message (pipeline progress) with the full report for this session
          // but actually we want to keep the pipeline message and just add the report
          return [...prev, {
            id: Date.now() + 100,
            role: 'ai',
            type: 'full_report',
            pipeline,
            scanId,
            timestamp: new Date()
          }];
        });
        setIsTyping(false);
      }, 500);

    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep(0);
      toast.error(error?.response?.data?.message || 'Analysis failed. Please try again.');
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        type: 'error',
        content: 'Analysis failed. Please upload a clearer image and try again.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMedicineContext = () => {
    if (!pipelineComplete || !messages.length) return ''
    const lastReport = [...messages].reverse().find(m => m.type === 'full_report')
    if (!lastReport) return ''
    
    const p = lastReport.pipeline
    const fields = p?.step1_packaging?.fields || {}
    
    return `--- MEDICINE ANALYSIS REPORT ---
Medicine Name: ${fields.medicineName || 'Unknown'}
Generic Name: ${fields.genericName || 'Unknown'}
Manufacturer: ${fields.manufacturer || 'Unknown'}
MRP: ${fields.mrp || 'Unknown'}
Category: ${fields.category || 'Unknown'}
Batch Number: ${p?.step2_batch?.batchNumber || 'Not detected'}

--- SAFETY STATUS ---
Packaging Status: ${p?.step1_packaging?.status}
Batch Status: ${p?.step2_batch?.status}
Risk Level: ${p?.finalRiskLevel}
Red Flags Detected: ${p?.step1_packaging?.redFlags?.join(', ') || 'None'}

--- DATABASE INFO ---
Found in Database: ${p?.step3_medicineDb?.found ? 'Yes' : 'No'}
Source: ${p?.step3_medicineDb?.source || 'N/A'}
Indications: ${p?.step3_medicineDb?.details?.indications || 'N/A'}
Warnings: ${p?.step3_medicineDb?.details?.warnings || 'N/A'}`
  }

  const handleSendMessage = async (content) => {
    if (!content.trim() || isTyping) return
    if (!pipelineComplete) {
      toast.error('Please analyze a medicine first before asking questions')
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      type: 'chat',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await api.post('/scan/chat', {
        message: content.trim(),
        scanId: currentScanId,
        medicineContext: getMedicineContext(),
        conversationHistory: messages
          .filter(m => m.type === 'chat' || !m.type)
          .slice(-6)
          .map(m => ({ role: m.role, content: m.content }))
      })

      const { reply, sources } = response.data.data

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        type: 'chat',
        content: reply,
        sources: sources || [],
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'ai',
        type: 'chat',
        content: 'Sorry, I could not get information right now. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="mg-root">
      <section className="py-12 bg-bg-0 border-b border-line">
        <div className="mg-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="mg-badge mg-badge--green mb-3">
                <span className="mg-badge__dot" />
                AI-Powered Verification
              </span>
              <h1 className="mg-section-header__title text-left mb-2">Medicine Scanner</h1>
              <p className="mg-section-header__sub text-left m-0">Verify authenticity using multi-step AI analysis</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleClearHistory} className="mg-btn mg-btn--ghost mg-btn--sm">
                Clear History
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Section: Image Upload (40%) */}
          <div className="w-full lg:w-[40%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mg-card sticky top-24"
            >
              <div className="mb-8">
                <h2 className="text-xl font-bold text-text-hi mb-2">Upload Package</h2>
                <p className="text-sm text-text-md">Take a clear photo of the medicine's front label and batch details.</p>
              </div>
              
              <ImageSection 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                hasAnalyzed={pipelineComplete} 
              />

              <div className="mt-8 p-5 rounded-xl bg-accent-glow border border-accent/20">
                <div className="flex gap-4">
                  <div className="p-2.5 h-fit rounded-lg bg-accent text-bg-0 shadow-glow">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-hi uppercase tracking-wider mb-1">How it works</p>
                    <p className="text-xs text-text-md leading-relaxed">
                      Our AI engine scans the packaging for visual inconsistencies, verifies batch numbers against official databases, and checks manufacturer records.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-3 p-4 bg-red-dim border border-red/20 rounded-xl">
                <ShieldAlert size={18} className="text-red flex-shrink-0" />
                <p className="text-[11px] text-text-md leading-tight">
                  <strong>Disclaimer:</strong> {ANALYSIS_DISCLAIMER}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Section: Chat Window (60%) */}
          <div className="w-full lg:w-[60%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ChatSection 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                onClearHistory={handleClearHistory}
                isTyping={isTyping}
                hasAnalyzed={pipelineComplete}
                currentStep={currentStep}
                stepResults={stepResults}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
