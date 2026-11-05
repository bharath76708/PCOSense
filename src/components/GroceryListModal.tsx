import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Search,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Sparkles,
  Info,
  RefreshCw,
  MapPin
} from 'lucide-react';
import {
  ConsolidatedGroceryList,
  copyGroceryListToClipboard,
  formatGroceryListForClipboard
} from '../services/groceryListService';
import { GroceryCategory, GroceryItem } from '../types';
import { useLanguage } from '../translations';
import { NearbyGroceryFinder } from './NearbyGroceryFinder';

const SESSION_STORAGE_KEY = 'pcosense_session_grocery_checked_items';

const getInitialCheckedIds = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set<string>(parsed.filter((it): it is string => typeof it === 'string'));
      }
    }
  } catch (e) {
    console.error('Failed to load checked grocery items from sessionStorage:', e);
  }
  return new Set<string>();
};

const saveCheckedIdsToSession = (ids: Set<string>) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error('Failed to save checked grocery items to sessionStorage:', e);
  }
};

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  groceryList: ConsolidatedGroceryList;
}

export const GroceryListModal: React.FC<GroceryListModalProps> = ({
  isOpen,
  onClose,
  groceryList
}) => {
  const { isTelugu } = useLanguage();
  const [viewMode, setViewMode] = useState<'checklist' | 'formatted_text' | 'nearby_stores'>('checklist');
  const [activeCategory, setActiveCategory] = useState<GroceryCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpurchased' | 'purchased'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(() => getInitialCheckedIds());
  const [isCopied, setIsCopied] = useState(false);
  const [scaleServings, setScaleServings] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const toggleCheckItem = (id: string) => {
    setCheckedItemIds(prev => {
      const next = new Set<string>(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveCheckedIdsToSession(next);
      return next;
    });
  };

  const clearAllChecks = () => {
    const empty = new Set<string>();
    setCheckedItemIds(empty);
    saveCheckedIdsToSession(empty);
  };

  const markCategoryChecked = (categoryItems: GroceryItem[]) => {
    setCheckedItemIds(prev => {
      const next = new Set<string>(prev);
      categoryItems.forEach(it => next.add(it.id));
      saveCheckedIdsToSession(next);
      return next;
    });
  };

  const formattedText = formatGroceryListForClipboard(groceryList, isTelugu);

  const handleCopy = async () => {
    const success = await copyGroceryListToClipboard(formattedText);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items
  const allFlattenedItems = groceryList.categories.flatMap(c => c.items);
  const checkedCount = allFlattenedItems.filter(item => checkedItemIds.has(item.id)).length;
  const progressPercent =
    allFlattenedItems.length > 0
      ? Math.round((checkedCount / allFlattenedItems.length) * 100)
      : 0;

  const filteredCategories = groceryList.categories
    .map(cat => {
      if (activeCategory !== 'all' && cat.key !== activeCategory) {
        return { ...cat, items: [] };
      }
      const matchingItems = cat.items.filter(item => {
        const isChecked = checkedItemIds.has(item.id);
        if (statusFilter === 'unpurchased' && isChecked) return false;
        if (statusFilter === 'purchased' && !isChecked) return false;

        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          (item.pcosBenefit && item.pcosBenefit.toLowerCase().includes(q))
        );
      });
      return { ...cat, items: matchingItems };
    })
    .filter(cat => cat.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        id="pcos-grocery-list-modal"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>
                  {isTelugu ? '7 రోజుల కిరాణా సరుకుల జాబితా' : '7-Day Consolidated Grocery List'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {isTelugu
                  ? 'మీ వారం రోజుల యాంటీ-PCOS ఆహార సరుకులు'
                  : 'Your Weekly Anti-PCOS Shopping List'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isTelugu
                  ? `ప్రస్తుత ${groceryList.preference === 'non_vegetarian' ? 'మాంసాహార' : 'శాఖాహార'} ప్లాన్ మరియు మార్చిన వంటకాల ఆధారంగా సమగ్ర సరుకుల జాబితా.`
                  : `Curated across all 42 meals for your ${groceryList.preference.replace('_', ' ')} protocol. Grouped by supermarket aisles with PCOS hormonal benefits.`}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close"
              id="close-grocery-modal-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress & Quick Stats Ribbon */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">
                {isTelugu
                  ? `పూర్తయినవి: ${checkedCount} / ${allFlattenedItems.length}`
                  : `Progress: ${checkedCount} of ${allFlattenedItems.length} purchased (${progressPercent}%)`}
              </span>
              <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: Copy, Print, Scale, ViewMode */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle: Checklist vs Formatted Text vs Nearby Grocery */}
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('checklist')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    viewMode === 'checklist' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  id="toggle-grocery-view-checklist"
                >
                  <ShoppingCart className="h-3 w-3" />
                  <span>{isTelugu ? 'చెక్‌లిస్ట్' : 'Checklist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('formatted_text')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    viewMode === 'formatted_text' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  id="toggle-grocery-view-text"
                >
                  <Copy className="h-3 w-3" />
                  <span>{isTelugu ? 'టెక్స్ట్ జాబితా' : 'Formatted Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('nearby_stores')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    viewMode === 'nearby_stores' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  id="toggle-grocery-view-nearby"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{isTelugu ? 'సమీప దుకాణాలు' : 'Nearby Stores'}</span>
                </button>
              </div>

              {/* Servings Scale */}
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setScaleServings(1)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    scaleServings === 1 ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Standard 1 Person Portions"
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setScaleServings(2)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    scaleServings === 2 ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Double Quantities (2 People)"
                >
                  2x
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                  isCopied
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                id="copy-grocery-clipboard-btn"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>
                  {isCopied
                    ? isTelugu
                      ? 'కాపీ చేయబడింది!'
                      : 'Copied!'
                    : isTelugu
                    ? 'కాపీ చేయండి'
                    : 'Copy List'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/20 transition-all"
                id="print-grocery-modal-btn"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'ప్రింట్' : 'Print'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Either Nearby Stores, Formatted Text or Checklist */}
        {viewMode === 'nearby_stores' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950">
            <NearbyGroceryFinder groceryList={groceryList} />
          </div>
        ) : viewMode === 'formatted_text' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 font-sans">
              <div>
                <p className="text-sm font-bold text-white">
                  {isTelugu ? 'ఫార్మాట్ చేసిన టెక్స్ట్ కిరాణా జాబితా' : 'Formatted Plain Text Grocery List'}
                </p>
                <p className="text-xs text-slate-400">
                  {isTelugu
                    ? 'వాట్సాప్, నోట్స్ లేదా ఇమెయిల్‌కి సులభంగా కాపీ చేసుకోవడానికి సిద్ధంగా ఉంది.'
                    : 'Grouped by category, sorted, and formatted for notes apps, WhatsApp, or instant clipboard copy.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border shrink-0 ${
                  isCopied
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-teal-700 hover:bg-teal-600 text-white border-teal-600'
                }`}
                id="copy-formatted-text-direct-btn"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied ? (isTelugu ? 'కాపీ చేయబడింది!' : 'Copied to Clipboard!') : (isTelugu ? 'క్లిప్‌బోర్డ్‌కి కాపీ చేయండి' : 'Copy Formatted Text')}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 sm:p-5 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap select-all font-mono">
                {formattedText}
              </pre>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Category Filter Strip */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      isTelugu
                        ? 'సరుకులు లేదా ప్రయోజనం ద్వారా శోధించండి (ఉదా: చియా, పాలకూర)...'
                        : 'Search ingredients or benefits (e.g., chia, spearmint, avocado)...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    id="grocery-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {checkedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllChecks}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>{isTelugu ? 'టిక్కులు క్లియర్ చేయండి' : 'Reset Checked Items'}</span>
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    activeCategory === 'all'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {isTelugu ? 'అన్నీ' : 'All Items'} ({allFlattenedItems.length})
                </button>

                {groceryList.categories.map(cat => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                        isActive
                          ? 'bg-teal-800 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{isTelugu ? cat.titleTe : cat.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {cat.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Checklist Mode Status Filters */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'పరిస్థితి ఫిల్టర్:' : 'Checklist Filter:'}
                </span>

                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isTelugu ? 'అన్నీ' : 'All'} ({allFlattenedItems.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('unpurchased')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === 'unpurchased'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🛒 {isTelugu ? 'కొనవలసినవి' : 'To Buy'} ({allFlattenedItems.length - checkedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('purchased')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === 'purchased'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    ✓ {isTelugu ? 'సేకరించినవి' : 'Collected / Purchased'} ({checkedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Items Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" id="printable-grocery-list">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {isTelugu ? 'సరుకులు కనుగొనబడలేదు.' : 'No ingredients matched your search filter.'}
                  </p>
                </div>
              ) : (
                filteredCategories.map(category => {
                  const allCategoryChecked = category.items.every(it => checkedItemIds.has(it.id));
                  return (
                    <div key={category.key} className="space-y-3">
                      {/* Category Section Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {isTelugu ? category.titleTe : category.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => markCategoryChecked(category.items)}
                            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            {allCategoryChecked
                              ? isTelugu
                                ? '✓ కేటగిరీ పూర్తయింది'
                                : '✓ All Collected'
                              : isTelugu
                              ? 'అన్నీ టిక్ చేయండి'
                              : 'Mark Category Collected'}
                          </button>
                          <span className="text-xs font-bold text-slate-400">
                            {category.items.length} {isTelugu ? 'వస్తువులు' : 'items'}
                          </span>
                        </div>
                      </div>

                      {/* Items Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {category.items.map(item => {
                          const isChecked = checkedItemIds.has(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleCheckItem(item.id)}
                              className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 select-none ${
                                isChecked
                                  ? 'bg-slate-100/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-500 shadow-2xs'
                              }`}
                              id={`grocery-item-${item.id}`}
                            >
                              <button
                                type="button"
                                className="mt-0.5 text-teal-600 dark:text-teal-400 shrink-0"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleCheckItem(item.id);
                                }}
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600 hover:text-teal-500" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight ${
                                        isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                      }`}
                                    >
                                      {item.name}
                                    </span>
                                    {isChecked && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                        ✓ {isTelugu ? 'సేకరించబడింది' : 'Collected'}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300 shrink-0 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800">
                                    {scaleServings === 2 ? `2x: ${item.amount}` : item.amount}
                                  </span>
                                </div>

                              {/* PCOS Hormonal Benefit Tag */}
                              {item.pcosBenefit && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{item.pcosBenefit}</span>
                                </p>
                              )}

                              {/* Used In Note */}
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex flex-wrap gap-1 pt-0.5">
                                <span className="font-semibold">{isTelugu ? 'వినియోగం:' : 'Used in:'}</span>
                                <span>
                                  {item.usedInMeals
                                    .map(u => `Day ${u.dayNumber} ${u.mealType.replace('_', ' ')}`)
                                    .slice(0, 3)
                                    .join(', ')}
                                  {item.usedInMeals.length > 3 ? ` +${item.usedInMeals.length - 3} more` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </>
        )}

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              {isTelugu
                ? 'సేంద్రీయ పదార్ధాలు, కోల్డ్ ప్రెస్డ్ నూనెలు మరియు తాజా కూరగాయలను ఎంచుకోవడం హార్మోన్ల సమతుల్యతకు ఉత్తమం.'
                : 'Tip: Prioritize whole spices, cold-pressed oils, and A2 curd for optimal gut estrobolome health.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
          >
            {isTelugu ? 'ముగించు' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
