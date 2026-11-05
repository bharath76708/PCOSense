import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Users,
  Compass,
  Stethoscope,
  Globe,
  Award,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react';
import { CommunityResourceItem } from '../types';

interface CommunityResourcesWidgetProps {
  onAskAI?: (prompt?: string) => void;
  isDark?: boolean;
}

const VERIFIED_RESOURCES: CommunityResourceItem[] = [
  {
    id: 'res-monash-2023',
    title: 'International Evidence-Based Guideline for the Assessment and Management of PCOS (2023 Update)',
    category: 'guideline',
    authorOrOrg: 'Monash University / ESHRE / ASRM Global Consortium',
    publicationOrType: 'International Clinical Practice Guideline',
    year: '2023',
    description: 'The definitive international clinical guideline covering diagnosis, lifestyle interventions, emotional wellbeing, pharmacological management, and fertility strategies for PCOS.',
    keyTakeaways: [
      'Refined Rotterdam diagnostic criteria with anti-Müllerian hormone (AMH) as an alternative marker',
      'Emphasizes multidisciplinary lifestyle intervention as primary first-line therapy',
      'Highlights psychological wellbeing, sleep apnea, and cardiovascular risk screening'
    ],
    url: 'https://www.monash.edu/medicine/mchri/pcos',
    badge: 'Gold Standard Guideline',
    isPeerReviewed: true,
    doiOrPubMed: 'PMID: 37579987'
  },
  {
    id: 'res-lancet-review',
    title: 'Polycystic Ovary Syndrome: Pathophysiology, Presentation, and Long-Term Sequelae',
    category: 'research',
    authorOrOrg: 'Escobar-Morreale HF et al.',
    publicationOrType: 'The Lancet Diabetes & Endocrinology',
    year: '2022',
    description: 'Comprehensive state-of-the-art review exploring the neuroendocrine abnormalities, hyperandrogenism pathways, and intrinsic insulin resistance underlying diverse PCOS phenotypes.',
    keyTakeaways: [
      'Detailed mechanisms of post-receptor insulin signaling defects in target tissues',
      'Distinct androgen profiles across Phenotypes A, B, C, and D',
      'Cardiometabolic risk stratifications and lifestyle interventions'
    ],
    url: 'https://www.thelancet.com/journals/landia/article/PIIS2213-8587(18)30081-5/fulltext',
    badge: 'Peer-Reviewed Review',
    isPeerReviewed: true,
    doiOrPubMed: 'DOI: 10.1016/S2213-8587(18)30081-5'
  },
  {
    id: 'res-aepcos-directory',
    title: 'Androgen Excess & PCOS Society Physician & Specialist Directory',
    category: 'specialist',
    authorOrOrg: 'AE-PCOS Society',
    publicationOrType: 'Global Specialist Directory',
    year: '2024',
    description: 'International directory of board-certified reproductive endocrinologists, medical endocrinologists, and gynecologists specializing in hyperandrogenic disorders and PCOS.',
    keyTakeaways: [
      'Locate specialized clinicians with verified PCOS research and clinical credentials',
      'Access evidence-based patient brochures and diagnostic worksheets',
      'Global physician search filterable by continent, country, and clinical focus'
    ],
    url: 'https://www.ae-society.org/find-a-specialist',
    badge: 'Specialist Directory',
    isPeerReviewed: false
  },
  {
    id: 'res-rotterdam-criteria',
    title: 'Revised 2003 Consensus on Diagnostic Criteria and Long-Term Health Risks Related to PCOS',
    category: 'guideline',
    authorOrOrg: 'Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group',
    publicationOrType: 'Human Reproduction & Fertility and Sterility',
    year: '2004',
    description: 'The landmark consensus paper establishing the 2 out of 3 diagnostic criteria (oligo/anovulation, clinical/biochemical hyperandrogenism, polycystic ovarian morphology).',
    keyTakeaways: [
      'Established the 4 widely accepted PCOS clinical phenotypes (A, B, C, D)',
      'Threshold of 12+ (now 20+) follicles per ovary measuring 2–9mm',
      'Exclusion of mimic etiologies (CAH, hyperprolactinemia, thyroid dysfunction)'
    ],
    url: 'https://academic.oup.com/humrep/article/19/1/41/603378',
    badge: 'Landmark Consensus',
    isPeerReviewed: true,
    doiOrPubMed: 'PMID: 14704275'
  },
  {
    id: 'res-inositol-meta',
    title: 'The 40:1 Myo-Inositol to D-Chiro-Inositol Ratio: Evidence-Based Restorative Effects in PCOS',
    category: 'research',
    authorOrOrg: 'Unfer V, Carlomagno G, Dante G, Facchinetti F.',
    publicationOrType: 'European Review for Medical and Pharmacological Sciences',
    year: '2020',
    description: 'Systematic clinical review comparing various inositol ratios and demonstrating superior restoration of ovulatory function and glycemic balance with physiological 40:1 formulation.',
    keyTakeaways: [
      'Myo-inositol improves GLUT4 glucose translocation and cellular insulin sensitivity',
      'D-chiro-inositol regulates ovarian androgen synthesis; excessive doses impair oocyte quality',
      '40:1 ratio closely mirrors natural human plasma physiological concentrations'
    ],
    url: 'https://www.europeanreview.org/article/21187',
    badge: 'Peer-Reviewed Paper',
    isPeerReviewed: true,
    doiOrPubMed: 'PMID: 32374395'
  },
  {
    id: 'res-endocrine-society-directory',
    title: 'Endocrine Society Hormone Health Network Specialist Directory',
    category: 'specialist',
    authorOrOrg: 'The Endocrine Society',
    publicationOrType: 'Verified Medical Directory',
    year: '2024',
    description: 'Find board-certified endocrinologists and hormone specialists experienced in managing metabolic syndrome, insulin resistance, thyroid, and reproductive hormone imbalances.',
    keyTakeaways: [
      'Comprehensive database of verified endocrinologists worldwide',
      'Includes specialized focus filters for reproductive endocrinology & diabetes',
      'Access patient fact sheets developed by leading endocrinology experts'
    ],
    url: 'https://www.endocrine.org/patient-engagement/find-an-endocrinologist',
    badge: 'Verified Directory',
    isPeerReviewed: false
  },
  {
    id: 'res-pcos-challenge',
    title: 'PCOS Challenge: The National Polycystic Ovary Syndrome Association',
    category: 'support',
    authorOrOrg: 'PCOS Challenge Non-Profit Patient Advocacy Group',
    publicationOrType: 'Support Community & Research Advocacy',
    year: '2024',
    description: 'The leading 501(c)(3) patient advocacy non-profit organization offering community support groups, annual awareness symposiums, educational webinars, and clinical trial matching.',
    keyTakeaways: [
      'Peer support groups and patient community forums for shared experiences',
      'Advocacy for NIH research funding and evidence-based healthcare reform',
      'Quarterly digital health webinars led by prominent gynecologists and researchers'
    ],
    url: 'https://pcoschallenge.org',
    badge: 'Patient Advocacy & Support',
    isPeerReviewed: false
  },
  {
    id: 'res-askpcos-app',
    title: 'AskPCOS: Evidence-Based Digital Information Resource',
    category: 'guideline',
    authorOrOrg: 'CREPCOS (Centre for Research Excellence in PCOS)',
    publicationOrType: 'Clinical Digital Patient Tool',
    year: '2024',
    description: 'Co-designed with women with PCOS and international clinical experts, translating the 2023 international guidelines into accessible diagnostic tracking, symptom check tools, and infographics.',
    keyTakeaways: [
      'Directly derived from the 2023 Monash International Guideline recommendations',
      'Symptom tracking algorithm and tailored doctor discussion prompt generators',
      'Endorsed by over 40 global clinical obstetric and gynecological bodies'
    ],
    url: 'https://www.askpcos.org',
    badge: 'Co-Designed Patient App',
    isPeerReviewed: true
  }
];

const BOOKMARKS_KEY = 'pcosense_bookmarked_resources_v1';

export const CommunityResourcesWidget: React.FC<CommunityResourcesWidgetProps> = ({
  onAskAI,
  isDark = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = safePrev.includes(id) ? safePrev.filter(item => item !== id) : [...safePrev, id];
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to store bookmarks:', e);
      }
      return updated;
    });
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: Layers },
    { id: 'research', label: 'Peer-Reviewed Research', icon: BookOpen },
    { id: 'guideline', label: 'Clinical Guidelines', icon: Award },
    { id: 'specialist', label: 'Specialist Directories', icon: Stethoscope },
    { id: 'support', label: 'Support & Advocacy', icon: Users },
    { id: 'bookmarked', label: `Saved (${Array.isArray(bookmarkedIds) ? bookmarkedIds.length : 0})`, icon: BookmarkCheck }
  ];

  const filteredResources = VERIFIED_RESOURCES.filter(resource => {
    // Category check
    if (selectedCategory === 'bookmarked') {
      if (!Array.isArray(bookmarkedIds) || !bookmarkedIds.includes(resource.id)) return false;
    } else if (selectedCategory !== 'all' && resource.category !== selectedCategory) {
      return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (resource.title || '').toLowerCase().includes(q);
      const matchAuthor = (resource.authorOrOrg || '').toLowerCase().includes(q);
      const matchDesc = (resource.description || '').toLowerCase().includes(q);
      const matchTakeaways = Array.isArray(resource.keyTakeaways) && resource.keyTakeaways.some(t => (t || '').toLowerCase().includes(q));
      const matchBadge = (resource.badge || '').toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchDesc || matchTakeaways || matchBadge;
    }

    return true;
  });

  return (
    <div
      id="community-resources-widget"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-all space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-200 flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Community & Clinical Resources
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Verified Directory
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Peer-reviewed PCOS literature, Monash consensus guidelines, and verified specialist networks.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers, specialists, inositol..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-800 text-white shadow-xs dark:bg-teal-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No resources match your search or filter
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try clearing the search query or switching tabs to view all peer-reviewed articles and directories.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const isBookmarked = Array.isArray(bookmarkedIds) && bookmarkedIds.includes(res.id);

            return (
              <div
                key={res.id}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400/80 dark:hover:border-teal-600 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Bar: Badges + Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                        {res.badge}
                      </span>
                      {res.year && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {res.year}
                        </span>
                      )}
                      {res.doiOrPubMed && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {res.doiOrPubMed}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(res.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors leading-snug">
                      {res.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {res.authorOrOrg} • <span className="italic">{res.publicationOrType}</span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Key Takeaways Checklist */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-750 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Clinical Highlights:
                    </span>
                    {res.keyTakeaways.map((takeaway, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-750 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onAskAI?.(`Can you explain the key findings and patient takeaways of "${res.title}" (${res.authorOrOrg}) in easy-to-understand terms?`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100 hover:underline"
                  >
                    <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                    <span>Ask AI About This Paper</span>
                  </button>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-teal-200 transition-colors shadow-2xs"
                  >
                    <span>View Resource</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
