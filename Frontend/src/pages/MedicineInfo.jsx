import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  Clock3,
  Info,
  Pill,
  Search,
  ShieldAlert,
  Thermometer,
  X
} from 'lucide-react';
import api from '../services/api.js';

const SEARCH_EXAMPLES = ['Paracetamol', 'Azithromycin', 'Metformin', 'Ibuprofen', 'Omeprazole'];
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage & Dosage' },
  { id: 'safety', label: 'Safety' },
  { id: 'storage', label: 'Storage' }
];

const truncateText = (text = '', limit = 600) => {
  const safe = String(text || 'Not available').trim();
  if (safe.length <= limit) return { text: safe, hasMore: false };
  return { text: `${safe.slice(0, limit)}...`, hasMore: true };
};

const DetailLongText = ({ id, label, icon, tone = 'normal', text, expandedMap, onToggle }) => {
  const raw = text || 'Not available';
  const expanded = Boolean(expandedMap[id]);
  const { text: shortText, hasMore } = truncateText(raw, 600);

  const toneClass =
    tone === 'warn'
      ? 'bg-warning/10 border-warning/40'
      : tone === 'danger'
        ? 'bg-danger/10 border-danger/30'
        : 'bg-bg-primary border-border-color';

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
      </div>
      <p className="text-sm text-text-secondary whitespace-pre-wrap leading-6">
        {expanded ? raw : shortText}
      </p>
      {hasMore && (
        <button
          type="button"
          className="mt-2 text-xs text-primary font-semibold hover:underline"
          onClick={() => onToggle(id)}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

const MedicineInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const [expandedSections, setExpandedSections] = useState({});
  const [isMobilePanel, setIsMobilePanel] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  const suggestionRef = useRef(null);

  useEffect(() => {
    setAiQuestion('');
    setAiMessages([]);
    setAiError('');
  }, [selectedMedicine?.id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const res = await api.get(`/medicines/suggestions?query=${encodeURIComponent(q)}`);
        const list = Array.isArray(res?.data?.data) ? res.data.data.slice(0, 6) : [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobilePanel(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const runSearch = async (query) => {
    const q = query.trim();
    if (q.length < 2) {
      setError('Please enter at least 2 characters to search.');
      setResults([]);
      setHasSearched(true);
      return;
    }

    setIsSearching(true);
    setError('');
    setShowSuggestions(false);
    setHasSearched(true);

    try {
      const res = await api.get(`/medicines/search?query=${encodeURIComponent(q)}`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setResults(list);
      setSelectedMedicine(null);
      setActiveTab('overview');
      setExpandedSections({});

      if (list.length === 0) {
        setError('No medicine found for your search. Try searching by generic name. Example: search paracetamol instead of Crocin.');
      }
    } catch {
      setResults([]);
      setError('External medicine database is temporarily unavailable. Showing results from our local Indian medicines database only.');
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchClick = () => {
    runSearch(searchQuery);
  };

  const onSelectSuggestion = (name) => {
    setSearchQuery(name);
    runSearch(name);
  };

  const onEnterSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(searchQuery);
    }
  };

  const sourceBadge = (source) => {
    if (source === 'Local') {
      return <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Indian DB</span>;
    }
    return <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">OpenFDA</span>;
  };

  const panelMotion = useMemo(() => {
    if (isMobilePanel) {
      return {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
      };
    }
    return {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    };
  }, [isMobilePanel]);

  const askMedicineAI = async () => {
    const question = aiQuestion.trim();
    if (!selectedMedicine || question.length < 2 || isAskingAI) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: question
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setAiQuestion('');
    setAiError('');
    setIsAskingAI(true);

    try {
      const res = await api.post('/medicines/ask-ai', {
        question,
        medicine: selectedMedicine
      });

      const answer = res?.data?.data?.response || 'I could not generate a response right now.';
      setAiMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: answer
        }
      ]);
    } catch (err) {
      setAiError(
        err?.response?.data?.message ||
          'AI service is temporarily unavailable. Please try again.'
      );
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="mg-root">
      <section className="mg-hero py-12 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="rounded-2xl bg-bg-1/80 backdrop-blur-md p-8 md:p-12 border border-line shadow-2xl" ref={suggestionRef}>
            <span className="mg-badge mg-badge--green mb-4">
              <span className="mg-badge__dot" />
              Drug Knowledge Base
            </span>
            <h1 className="mg-hero__headline text-4xl md:text-6xl mb-4">Medicine Information</h1>
            <p className="mg-hero__sub mb-8">
              Access comprehensive data on over 10,000+ medicines, including dosage, side effects, and safety guidelines.
            </p>

            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-lo" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={onEnterSearch}
                    placeholder="Search by brand or generic name..."
                    className="input-field pl-14 pr-12 py-5 text-lg"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-lo hover:text-text-hi"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSearchClick}
                  className="mg-btn mg-btn--primary px-10 text-lg shadow-glow"
                >
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-3 w-full rounded-2xl border border-line bg-bg-1 shadow-2xl z-30 overflow-hidden backdrop-blur-xl">
                  {suggestions.slice(0, 6).map((item, idx) => (
                    <button
                      key={`${item.name}-${idx}`}
                      type="button"
                      onClick={() => onSelectSuggestion(item.name)}
                      className="w-full text-left px-6 py-4 hover:bg-bg-2 border-b border-line last:border-b-0 transition-colors"
                    >
                      <p className="font-bold text-text-hi">{item.name}</p>
                      <p className="text-xs text-text-md mt-0.5">{item.manufacturer || 'Unknown manufacturer'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!hasSearched && (
              <div className="mt-8 pt-8 border-t border-line">
                <p className="text-xs font-bold text-text-lo uppercase tracking-widest mb-4">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example);
                        runSearch(example);
                      }}
                      className="mg-btn mg-btn--ghost mg-btn--sm hover:bg-accent-glow hover:text-accent hover:border-accent"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
          {isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-border-color bg-bg-secondary p-5 animate-pulse">
                  <div className="h-5 bg-bg-primary rounded w-2/3 mb-3" />
                  <div className="h-4 bg-bg-primary rounded w-1/2 mb-4" />
                  <div className="h-3 bg-bg-primary rounded w-full mb-2" />
                  <div className="h-3 bg-bg-primary rounded w-3/4 mb-4" />
                  <div className="h-9 bg-bg-primary rounded w-full" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((med) => (
                <motion.div
                  key={med.id}
                  whileHover={{ y: -5 }}
                  className="mg-card group"
                >
                  <h3 className="text-xl font-bold text-text-hi group-hover:text-accent transition-colors">{med.name}</h3>
                  <p className="text-sm text-text-md mt-1 italic">{med.genericName || 'Not available'}</p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-text-md">
                    <Building2 size={15} className="text-accent" />
                    <span>{med.manufacturer || 'Unknown manufacturer'}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="mg-badge bg-bg-2 border-line text-text-md">
                      {med.dosageForm || 'Not specified'}
                    </span>
                    {med.requiresPrescription ? (
                      <span className="mg-badge mg-badge--red">Rx Required</span>
                    ) : (
                      <span className="mg-badge mg-badge--green">OTC</span>
                    )}
                    {med.source === 'Local' ? (
                      <span className="mg-badge bg-accent-glow text-accent border-accent/20">Indian DB</span>
                    ) : (
                      <span className="mg-badge bg-amber/10 text-amber border-amber/20">OpenFDA</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedicine(med);
                      setActiveTab('overview');
                      setExpandedSections({});
                    }}
                    className="mg-btn mg-btn--primary w-full mt-6 justify-center"
                  >
                    View Full Details
                  </button>
                </motion.div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="rounded-2xl border border-border-color bg-bg-secondary p-10 text-center">
              <Pill className="mx-auto text-text-secondary/60" size={44} />
              <p className="mt-4 text-text-secondary">
                {error || 'No medicine found for your search. Try searching by generic name. Example: search paracetamol instead of Crocin.'}
              </p>
            </div>
          ) : null}

          {error && results.length > 0 && (
            <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 text-warning px-4 py-3 text-sm">
              {error}
            </div>
          )}
      </div>

      <AnimatePresence>
        {selectedMedicine && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedicine(null)}
            />

            <motion.aside
              className={
                isMobilePanel
                  ? 'fixed z-50 inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl bg-bg-secondary border-t border-border-color p-4 overflow-y-auto'
                  : 'fixed z-50 top-0 right-0 h-full w-full max-w-2xl bg-bg-secondary border-l border-border-color p-6 overflow-y-auto'
              }
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {isMobilePanel && <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-border-color" />}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{selectedMedicine.name}</h2>
                  <p className="text-text-secondary mt-1">{selectedMedicine.genericName || 'Not available'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedMedicine.requiresPrescription ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-danger/20 text-danger">Prescription (Rx)</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Over-the-counter (OTC)</span>
                    )}
                    {sourceBadge(selectedMedicine.source)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMedicine(null)}
                  className="p-2 rounded-lg border border-border-color text-text-secondary hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-b border-border-color pb-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['Name', selectedMedicine.name],
                      ['Generic Name', selectedMedicine.genericName],
                      ['Manufacturer', selectedMedicine.manufacturer],
                      ['Category', selectedMedicine.category],
                      ['Dosage Form', selectedMedicine.dosageForm],
                      ['Route of Administration', selectedMedicine.route],
                      ['Active Substance', selectedMedicine.substanceName],
                      ['NDC Number', selectedMedicine.ndc]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border-color bg-bg-primary p-3">
                        <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
                        <p className="mt-1 text-sm font-medium text-text-primary">{value || 'Not available'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'usage' && (
                  <div className="space-y-3">
                    <DetailLongText
                      id="indications"
                      label="What is it used for"
                      icon={<Info size={16} className="text-primary" />}
                      text={selectedMedicine.indications}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                    <DetailLongText
                      id="dosage"
                      label="How to take it"
                      icon={<Clock3 size={16} className="text-primary" />}
                      text={selectedMedicine.dosageInstructions}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                    <DetailLongText
                      id="contraindications"
                      label="When not to take it"
                      icon={<AlertTriangle size={16} className="text-danger" />}
                      tone="danger"
                      text={selectedMedicine.contraindications}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div className="space-y-3">
                    <DetailLongText
                      id="warnings"
                      label="Warnings"
                      icon={<AlertTriangle size={16} className="text-warning" />}
                      tone="warn"
                      text={selectedMedicine.warnings}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                    <DetailLongText
                      id="sideEffects"
                      label="Side Effects"
                      icon={<ShieldAlert size={16} className="text-danger" />}
                      text={selectedMedicine.sideEffects}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                    <DetailLongText
                      id="interactions"
                      label="Drug Interactions"
                      icon={<Info size={16} className="text-primary" />}
                      text={selectedMedicine.drugInteractions}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                  </div>
                )}

                {activeTab === 'storage' && (
                  <div className="space-y-3">
                    <DetailLongText
                      id="storage"
                      label="Storage Instructions"
                      icon={<Thermometer size={16} className="text-primary" />}
                      text={selectedMedicine.storageInstructions}
                      expandedMap={expandedSections}
                      onToggle={(id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))}
                    />
                    <div className="rounded-xl border border-border-color bg-bg-primary p-4">
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Storage Tips</h4>
                      <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                        <li>Keep medicines in original packaging.</li>
                        <li>Store away from moisture, heat, and direct sunlight.</li>
                        <li>Keep out of reach of children and pets.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-border-color bg-bg-primary p-4 text-xs text-text-secondary leading-5">
                This information is sourced from OpenFDA and local database. Always consult a licensed doctor or pharmacist before taking any medicine. MediGuard is not responsible for medical decisions.
              </div>

              <div className="mt-4 rounded-xl border border-border-color bg-bg-primary p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">Ask AI</h4>
                  <span className="text-[11px] text-text-secondary">Powered by Groq</span>
                </div>

                <p className="mt-1 text-xs text-text-secondary">
                  Ask anything related to {selectedMedicine.name}. Example: dosage timing, side effects, interactions, precautions.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        askMedicineAI();
                      }
                    }}
                    placeholder="Ask about this medicine..."
                    className="flex-1 rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    disabled={isAskingAI}
                  />
                  <button
                    type="button"
                    onClick={askMedicineAI}
                    disabled={isAskingAI || aiQuestion.trim().length < 2}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isAskingAI || aiQuestion.trim().length < 2
                        ? 'bg-border-color text-text-secondary cursor-not-allowed'
                        : 'bg-primary text-white hover:opacity-90'
                    }`}
                  >
                    {isAskingAI ? 'Thinking...' : 'Ask AI'}
                  </button>
                </div>

                {aiError && (
                  <p className="mt-2 text-xs text-danger">{aiError}</p>
                )}

                {aiMessages.length > 0 && (
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
                    {aiMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary/15 border border-primary/30 text-text-primary'
                            : 'bg-bg-secondary border border-border-color text-text-secondary'
                        }`}
                      >
                        <p className="text-[11px] font-semibold mb-1 uppercase tracking-wide text-text-secondary">
                          {msg.role === 'user' ? 'You' : 'AI'}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicineInfo;
