import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSection = ({ messages, onSendMessage, isTyping, hasAnalyzed }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const analysisDisclaimer = 'Note: This is an AI analysis based on visual packaging inspection only. For critical medical decisions, always consult a licensed pharmacist or doctor. MediGuard is not responsible for misidentification.';

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
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-bg-secondary border border-border-color text-primary'
                  }`}>
                    {msg.role === 'user' ? 'U' : <Shield size={14} />}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold text-text-secondary uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'user' ? 'You' : 'MediGuard AI'}
                    </p>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none' 
                        : msg.isWarning 
                          ? 'bg-warning/10 border-l-4 border-warning text-text-primary rounded-tl-none'
                          : 'bg-bg-secondary border-l-4 border-primary text-text-primary rounded-tl-none prose prose-invert max-w-none'
                    }`}>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'ai' && msg.isAnalysis && (
                      <p className="px-1 text-[11px] italic text-text-secondary leading-relaxed max-w-[95%]">
                        {msg.disclaimer || analysisDisclaimer}
                      </p>
                    )}
                    <p className={`text-[9px] text-text-secondary mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {isTyping && (
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
                  <span className="text-xs text-text-secondary italic">MediGuard AI is analyzing...</span>
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
            <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
               {input.length > 400 && (
                 <span className="text-[10px] text-text-secondary font-bold">
                   {input.length}/500
                 </span>
               )}
            </div>
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
