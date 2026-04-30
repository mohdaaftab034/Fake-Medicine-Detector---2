import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ImageSection from '../components/scanner/ImageSection';
import ChatSection from '../components/scanner/ChatSection';
import { scanMedicine, chatFollowUp } from '../services/scannerService';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

const ANALYSIS_DISCLAIMER = 'AI packaging analysis cannot confirm if medicine contents are genuine. Combine this with batch verification and purchase from verified chemists for maximum safety.';

const statusConfig = {
  LOOKS_PROFESSIONAL: {
    color: 'green',
    icon: CheckCircle,
    title: 'Packaging Looks Professional',
    subtitle: 'No visual red flags detected. Verify batch number for more certainty.'
  },
  HAS_ISSUES: {
    color: 'red',
    icon: ShieldAlert,
    title: 'Packaging Issues Detected',
    subtitle: 'Visual problems found. Do not consume without further verification.'
  },
  UNCLEAR: {
    color: 'amber',
    icon: AlertTriangle,
    title: 'Image Too Unclear to Analyze',
    subtitle: 'Please upload a clearer photo of the medicine packaging.'
  }
};

const parseAnalysisText = (text = '') => {
  const value = (pattern) => text.match(pattern)?.[1]?.trim() || 'Not visible';
  const batchNumber = value(/Batch(?:\s*Number|)?:\s*(.+)/i);
  const redFlagsMatch = text.match(/VISUAL RED FLAGS FOUND\s*\n([\s\S]*?)(?=MEDICINE DETAILS READ FROM IMAGE|IMPORTANT DISCLAIMER|$)/i);
  const redFlags = redFlagsMatch
    ? redFlagsMatch[1]
        .split('\n')
        .map((line) => line.replace(/^[-•*\d.\s]+/, '').trim())
        .filter((line) => line.length > 5 && !/^No visual red flags detected$/i.test(line))
    : [];
  const confidence = Number(text.match(/Confidence:\s*(\d+)%/i)?.[1] || 70);

  return {
    batchNumber,
    confidence,
    fields: {
      medicineName: value(/Name:\s*(.+)/i),
      manufacturer: value(/Manufacturer:\s*(.+)/i),
      mrp: value(/MRP:\s*(.+)/i),
      batchNumber,
      expiryDate: value(/Expiry:\s*(.+)/i),
      drugLicense: value(/Drug License No:\s*(.+)/i),
      manufacturerAddress: value(/Manufacturer Address:\s*(.+)/i)
    },
    redFlags
  };
};

const formatAnalysisForUser = (scanStatus, confidence, parsed) => {
  const statusText = statusConfig[scanStatus]?.title || 'Image Too Unclear to Analyze';
  const flagsText = parsed.redFlags?.length
    ? parsed.redFlags.map((flag, index) => `${index + 1}. ${flag}`).join('\n')
    : 'No visual red flags detected';

  return [
    'PACKAGING INSPECTION REPORT',
    '',
    'OVERALL STATUS',
    `Result: ${statusText}`,
    `Confidence: ${confidence}%`,
    '',
    'MEDICINE DETAILS',
    `Medicine Name: ${parsed.fields?.medicineName || 'Not visible'}`,
    `Manufacturer: ${parsed.fields?.manufacturer || 'Not visible'}`,
    `Batch Number: ${parsed.fields?.batchNumber || 'Not visible'}`,
    `Expiry Date: ${parsed.fields?.expiryDate || 'Not visible'}`,
    `MRP: ${parsed.fields?.mrp || 'Not visible'}`,
    `Drug License Number: ${parsed.fields?.drugLicense || 'Not visible'}`,
    `Manufacturer Address: ${parsed.fields?.manufacturerAddress || 'Not visible'}`,
    '',
    'VISUAL RED FLAGS',
    flagsText,
    '',
    'IMPORTANT NOTE',
    ANALYSIS_DISCLAIMER
  ].join('\n');
};

const Scanner = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisText, setAnalysisText] = useState('');

  const currentStatus = useMemo(() => {
    if (!analysisResult?.result) return null;
    return statusConfig[analysisResult.result] || statusConfig.UNCLEAR;
  }, [analysisResult]);

  const handleAnalyze = async (file) => {
    if (!file) {
      toast.error('Please upload a medicine image first.');
      return;
    }

    console.log('[SCANNER] Starting analysis for file:', file.name);

    const initialMessages = [{
      id: `new-scan-${Date.now()}`,
      role: 'ai',
      content: 'New medicine loaded. Analyzing...',
      timestamp: new Date(),
      isAnalysis: false
    }];

    if (file.size < 50 * 1024) {
      initialMessages.push({
        id: `warning-${Date.now()}`,
        role: 'ai',
        content: 'Warning: This image is quite small (under 50KB). The analysis might be less accurate due to low resolution. Please upload a higher quality photo if possible.',
        timestamp: new Date(),
        isAnalysis: false,
        isWarning: true
      });
    }

    const separator = {
      id: `sep-${Date.now()}`,
      role: 'ai',
      content: '--- New Analysis Session Started ---',
      timestamp: new Date(),
      isAnalysis: false,
      isSeparator: true
    };

    setMessages(prev => [...prev, separator, ...initialMessages]);
    setIsAnalyzing(true);
    setIsTyping(true);

    try {
      const response = await scanMedicine(file);
      const rawText = response.data?.data?.analysisText || response.data?.analysisText || '';
      const scanStatus = response.data?.data?.result || response.data?.result || 'UNCLEAR';
      const parsed = parseAnalysisText(rawText);
      const finalConfidence = response.data?.data?.confidence || response.data?.confidence || parsed.confidence;
      const cleanedResponse = formatAnalysisForUser(scanStatus, finalConfidence, parsed);

      setAnalysisText(rawText);
      setAnalysisResult({
        result: scanStatus,
        confidence: finalConfidence,
        ...parsed
      });
      setHasAnalyzed(true);
      
      const aiMessage = {
        id: Date.now(),
        role: 'ai',
        content: cleanedResponse,
        timestamp: new Date(),
        isAnalysis: true,
        status: scanStatus === 'LOOKS_PROFESSIONAL' ? 'GENUINE' : scanStatus === 'HAS_ISSUES' ? 'FAKE' : 'SUSPICIOUS',
        confidence: finalConfidence,
        disclaimer: ANALYSIS_DISCLAIMER
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Analysis Error:', error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        'I had trouble analyzing this image. Please try again.';
      const errorMessage = {
        id: Date.now(),
        role: 'ai',
        content: `I could not complete analysis for this upload.\n\nReason: ${serverMessage}\n\nPlease try again. If this repeats, upload the same image once more so I can retry with an alternate processing path.`,
        timestamp: new Date(),
        isAnalysis: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!hasAnalyzed) {
      const warningMessage = {
        id: Date.now(),
        role: 'ai',
        content: "Please analyze a medicine image first before asking questions.",
        timestamp: new Date(),
        isAnalysis: false
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date(),
      isAnalysis: false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const history = messages
      .filter(msg => !msg.isSeparator && msg.content !== 'New medicine loaded. Analyzing...')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    try {
      const response = await chatFollowUp(content, analysisText, history);
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.data?.response || "I'm having trouble generating that response right now.",
        timestamp: new Date(),
        isAnalysis: false
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: "I'm having trouble connecting right now. Please try your question again.",
        timestamp: new Date(),
        isAnalysis: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const goToBatchVerify = () => {
    const batchNumber = analysisResult?.batchNumber || analysisResult?.fields?.batchNumber;
    navigate('/batch-verify', {
      state: batchNumber && batchNumber !== 'Not visible' ? { batchNumber } : undefined
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section: Image Upload (40%) */}
        <div className="w-full lg:w-[40%]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-glass p-6 rounded-3xl border border-border-color sticky top-24"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                Scanner
              </h1>
              <p className="text-text-secondary mt-1">Upload image to verify authenticity</p>
            </div>
            
            <ImageSection 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
              hasAnalyzed={hasAnalyzed} 
            />

            {analysisResult && currentStatus && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className={`p-5 rounded-3xl border-2 ${currentStatus.color === 'green' ? 'border-success bg-success/10' : currentStatus.color === 'red' ? 'border-danger bg-danger/10' : 'border-warning bg-warning/10'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${currentStatus.color === 'green' ? 'bg-success/20' : currentStatus.color === 'red' ? 'bg-danger/20' : 'bg-warning/20'}`}>
                      <currentStatus.icon size={30} className={currentStatus.color === 'green' ? 'text-success' : currentStatus.color === 'red' ? 'text-danger' : 'text-warning'} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{currentStatus.title}</p>
                      <p className="text-text-secondary mt-1">{currentStatus.subtitle}</p>
                      <p className="mt-2 text-sm text-text-secondary">Confidence: {analysisResult.confidence}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    {Object.entries(analysisResult.fields || {}).map(([label, value]) => (
                      <div key={label} className="bg-bg-primary/80 rounded-2xl p-3 border border-border-color">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold">{label.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-text-primary mt-1">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <p className="font-semibold text-amber-200">{ANALYSIS_DISCLAIMER}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <button
                      type="button"
                      onClick={goToBatchVerify}
                      className="flex-1 px-5 py-4 rounded-2xl bg-cyan-500 text-white font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      Verify Batch Number
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/nearby-chemist')}
                      className="flex-1 px-5 py-4 rounded-2xl bg-success text-white font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      Find Verified Chemist
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Section: Chat Window (60%) */}
        <div className="w-full lg:w-[60%]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ChatSection 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isTyping={isTyping}
              hasAnalyzed={hasAnalyzed}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
