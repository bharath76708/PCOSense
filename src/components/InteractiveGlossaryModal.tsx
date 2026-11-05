import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { PCOS_KNOWLEDGE_BASE, KnowledgeTopic } from '../ml/ragKnowledge';
import { useLanguage } from '../translations';

interface InteractiveGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (term: string) => void;
}

export const InteractiveGlossaryModal: React.FC<InteractiveGlossaryModalProps> = ({
  isOpen,
  onClose,
  onAskAI
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(PCOS_KNOWLEDGE_BASE[0]);
  const { isTelugu } = useLanguage();

  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: isTelugu ? 'అన్నీ' : 'All' },
    { id: 'Diagnostic Criteria', label: isTelugu ? 'రోగ నిర్ధారణ ప్రమాణాలు' : 'Diagnostic Criteria' },
    { id: 'Biomarkers', label: isTelugu ? 'బయోమార్కర్లు' : 'Biomarkers' },
    { id: 'Symptoms', label: isTelugu ? 'లక్షణాలు' : 'Symptoms' },
    { id: 'Lifestyle & Diet', label: isTelugu ? 'జీవనశైలి & ఆహారం' : 'Lifestyle & Diet' },
    { id: 'Medical Workup', label: isTelugu ? 'వైద్య పరీక్షలు' : 'Medical Workup' },
    { id: 'Phenotypes', label: isTelugu ? 'ఫీనోటైప్‌లు' : 'Phenotypes' }
  ];

  const filteredTopics = PCOS_KNOWLEDGE_BASE.filter(topic => {
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.plainEnglishSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-900 to-indigo-950 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-teal-800/40 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isTelugu ? 'PCOS క్లినికల్ నిఘంటువు & భావనలు' : 'PCOS Clinical Glossary & Concepts'}
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {isTelugu
                  ? 'ప్రతి వైద్య పదం, బయోమార్కర్ మరియు రోగ నిర్ధారణ ప్రమాణాన్ని సులభమైన భాషలో అర్థం చేసుకోండి'
                  : 'Understand every medical term, biomarker, and diagnostic criterion in simple language'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SEARCH & CATEGORY BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isTelugu ? 'పదాలను వెతకండి: AMH, LH/FSH, ఫోలికల్స్, రోమాలు, రొటర్‌డ్యామ్...' : 'Search terms: AMH, LH/FSH, Follicles, Hirsutism, Rotterdam...'}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-COLUMN CONTENT */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* TOPICS LIST */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
            {filteredTopics.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                {isTelugu ? 'ఎలాంటి పదాలు దొరకలేదు.' : 'No matching terms found. Try searching for "follicles", "insulin", or "cycle".'}
              </div>
            ) : (
              filteredTopics.map(t => {
                const isSelected = selectedTopic?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopic(t)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-900 dark:bg-teal-950 text-white border-teal-800 dark:border-teal-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${
                          isSelected ? 'text-teal-300' : 'text-teal-700 dark:text-teal-400'
                        }`}
                      >
                        {t.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold truncate">{t.title}</h4>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${isSelected ? 'text-teal-300' : 'text-slate-400 dark:text-slate-500'}`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* TOPIC DETAIL VIEW */}
          <div className="md:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-900">
            {selectedTopic ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full">
                      {selectedTopic.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white mt-1.5">
                      {selectedTopic.title}
                    </h3>
                  </div>

                  {onAskAI && (
                    <button
                      onClick={() => {
                        onClose();
                        onAskAI(`Can you explain ${selectedTopic.title} in more detail?`);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-xl transition-all shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{isTelugu ? 'AI అసిస్టెంట్‌ని అడగండి' : 'Ask AI Assistant'}</span>
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 p-4 space-y-1">
                  <div className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                    <span>{isTelugu ? 'సులభమైన వివరణ:' : 'In Plain English:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedTopic.plainEnglishSummary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {isTelugu ? 'క్లినికల్ సందర్భం & మార్గదర్శకాలు' : 'Clinical Context & Guidelines'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedTopic.clinicalDetails}
                  </p>
                </div>

                {(selectedTopic.normalRange || selectedTopic.pcosPattern) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {selectedTopic.normalRange && (
                      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block">
                          {isTelugu ? 'సాధారణ పరిధి:' : 'Typical Reference:'}
                        </span>
                        <span className="text-xs text-emerald-800 dark:text-emerald-200 font-mono">
                          {selectedTopic.normalRange}
                        </span>
                      </div>
                    )}
                    {selectedTopic.pcosPattern && (
                      <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">
                          {isTelugu ? 'సాధారణ PCOS సరళి:' : 'Typical PCOS Pattern:'}
                        </span>
                        <span className="text-xs text-amber-800 dark:text-amber-200 font-mono">
                          {selectedTopic.pcosPattern}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{isTelugu ? 'చేయవలసిన చర్యలు:' : 'Actionable Advice:'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedTopic.actionableAdvice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                {isTelugu ? 'స్పష్టమైన క్లినికల్ వివరణల కోసం ఎడమవైపున ఒక అంశాన్ని ఎంచుకోండి.' : 'Select a topic on the left to read clear clinical explanations.'}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>{isTelugu ? 'రొటర్‌డ్యామ్ 2003 & ESHRE/ASRM మార్గదర్శకాల ఆధారంగా' : 'Grounded in Rotterdam 2003 & ESHRE/ASRM Consensus'}</span>
          <button
            onClick={onClose}
            className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl transition-all"
          >
            {isTelugu ? 'మూసివేయి' : 'Close Glossary'}
          </button>
        </div>
      </div>
    </div>
  );
};
