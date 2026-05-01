import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Shield, Trash2, Paperclip, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PipelineProgress from './PipelineProgress';
import FullReportCard from './FullReportCard';
import ChatMessageBubble from './ChatMessageBubble';

const ChatSection = ({ messages, onSendMessage, onClearHistory, isTyping, hasAnalyzed, currentStep, stepResults }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const STEPS = [
    { id: 1, label: 'AI Packaging Analysis', icon: '🔍', description: 'Analyzing packaging quality and visual elements...' },
    { id: 2, label: 'Batch Verification', icon: '📋', description: 'Checking batch number against recalled medicines database...' },
    { id: 3, label: 'Medicine Database Check', icon: '💊', description: 'Looking up medicine information and warnings...' },
    { id: 4, label: 'Nearby Chemist Search', icon: '🏪', description: 'Finding verified chemists near you...' },
  ]

  return (
    <div className="flex flex-col h-[700px] bg-bg-primary rounded-2xl border border-border-color overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-bold text-text-primary">MediGuard AI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Online</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="p-2 text-text-secondary hover:text-danger transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Clear History
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-chat-pattern"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="p-4 rounded-full bg-bg-secondary border border-border-color">
                <Bot size={40} className="text-primary" />
              </div>
              <div className="max-w-xs">
                <p className="text-text-primary font-bold">Welcome to MediGuard Chat</p>
                <p className="text-text-secondary text-sm">Upload a medicine image and click Analyze to get started. You can then ask me any questions about the medicine.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.type === 'separator' || msg.isSeparator) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 my-8"
                  >
                    <div className="flex-1 h-[1px] bg-border-color/50" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">
                      {msg.content}
                    </span>
                    <div className="flex-1 h-[1px] bg-border-color/50" />
                  </motion.div>
                );
              }

              if (msg.type === 'pipeline_progress') {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-bg-secondary/50 border border-border-color rounded-2xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-border-color bg-bg-secondary flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Analysis Pipeline</span>
                    </div>
                    <PipelineProgress 
                      currentStep={currentStep} 
                      stepResults={stepResults} 
                      steps={STEPS} 
                    />
                  </motion.div>
                )
              }

              if (msg.type === 'full_report') {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <FullReportCard pipeline={msg.pipeline} scanId={msg.scanId} />
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ChatMessageBubble message={msg} />
                </motion.div>
              );
            })
          )}

          {isTyping && !currentStep && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-primary">
                  <Shield size={14} />
                </div>
                <div className="bg-bg-secondary p-4 rounded-2xl rounded-tl-none border-l-4 border-primary flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs text-text-secondary italic">MediGuard AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-color bg-bg-secondary">
        <div className="relative flex items-center gap-2">
          <button className="p-2 text-text-secondary hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyPress}
              placeholder={hasAnalyzed ? "Ask anything about this medicine..." : "Type your message..."}
              disabled={isTyping}
              className="w-full bg-bg-primary border border-border-color rounded-xl py-3 px-4 pr-12 text-text-primary text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none max-h-32 disabled:opacity-50"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              !input.trim() || isTyping
                ? 'bg-bg-primary text-text-secondary'
                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
