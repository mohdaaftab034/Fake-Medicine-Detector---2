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
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
        <section className="mb-8" ref={suggestionRef}>
          <div className="rounded-2xl border border-border-color bg-bg-secondary p-6 md:p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold">Medicine Information</h1>
            <p className="mt-2 text-text-secondary max-w-3xl">
              Search any medicine to get complete information about usage, dosage, side effects and more.
            </p>

            <div className="mt-6 relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={onEnterSearch}
                    placeholder="Search by brand or generic name..."
                    className="w-full rounded-xl border border-border-color bg-bg-primary pl-11 pr-12 py-4 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-secondary hover:text-text-primary"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSearchClick}
                  className="h-[52px] px-6 rounded-xl bg-primary text-white font-semibold hover:opacity-90 whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full rounded-xl border border-border-color bg-bg-secondary shadow-2xl z-30 overflow-hidden">
                  {suggestions.slice(0, 6).map((item, idx) => (
                    <button
                      key={`${item.name}-${idx}`}
                      type="button"
                      onClick={() => onSelectSuggestion(item.name)}
                      className="w-full text-left px-4 py-3 hover:bg-bg-primary border-b border-border-color last:border-b-0"
                    >
                      <p className="font-semibold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.manufacturer || 'Unknown manufacturer'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!hasSearched && (
              <div className="mt-5">
                <p className="text-sm text-text-secondary mb-2">Search Examples</p>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setSearchQuery(example);
                        runSearch(example);
                      }}
                      className="px-3 py-1.5 rounded-full text-sm border border-border-color bg-bg-primary hover:border-primary hover:text-primary transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((med) => (
                <motion.div
                  key={med.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-border-color bg-bg-secondary p-5 shadow-lg hover:shadow-primary/10"
                >
                  <h3 className="text-xl font-bold text-text-primary">{med.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{med.genericName || 'Not available'}</p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                    <Building2 size={15} />
                    <span>{med.manufacturer || 'Unknown manufacturer'}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-bg-primary border border-border-color text-text-secondary">
                      {med.dosageForm || 'Not specified'}
                    </span>
                    {med.requiresPrescription ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-danger/20 text-danger">Rx</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">OTC</span>
                    )}
                    {sourceBadge(med.source)}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedicine(med);
                      setActiveTab('overview');
                      setExpandedSections({});
                    }}
                    className="mt-5 w-full rounded-xl py-2.5 bg-primary text-white font-semibold hover:opacity-90"
                  >
                    View Details
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
        </section>
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
