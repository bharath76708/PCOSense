/**
 * PCOSense Grounded Clinical Knowledge Base & RAG Retrieval Engine
 * Grounded in Rotterdam 2003 Consensus, ESHRE/ASRM 2023 Guidelines, and Monash University PCOS Guidelines.
 */

export interface KnowledgeTopic {
  id: string;
  category: 'Diagnostic Criteria' | 'Biomarkers' | 'Symptoms' | 'Lifestyle & Diet' | 'Medical Workup' | 'Phenotypes';
  keywords: string[];
  title: string;
  plainEnglishSummary: string;
  clinicalDetails: string;
  normalRange?: string;
  pcosPattern?: string;
  actionableAdvice: string;
}

export const PCOS_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'rotterdam_criteria',
    category: 'Diagnostic Criteria',
    keywords: ['rotterdam', 'diagnosis', 'criteria', 'diagnose', 'definition', 'how diagnosed'],
    title: 'Rotterdam 2003 Diagnostic Criteria',
    plainEnglishSummary: 'Doctors diagnose PCOS if a woman has at least 2 out of these 3 specific signs (after ruling out other thyroid or adrenal conditions): 1) Irregular or absent periods, 2) Signs or lab tests showing high male hormones (androgens), and 3) An ultrasound showing multiple small follicles on the ovaries.',
    clinicalDetails: 'The Rotterdam Consensus (2003) requires presence of at least 2 of 3 features: (1) Oligo- or anovulation (cycle length >35 days or <21 days), (2) Clinical or biochemical hyperandrogenism (hirsutism, acne, alopecia, or elevated free testosterone/DHEA-S), (3) Polycystic ovarian morphology (PCOM: >=12-20 follicles of 2-9mm or ovarian volume >10 mL).',
    actionableAdvice: 'Having ovarian follicles alone is not PCOS. Discuss cycle patterns and lab hormone testing with an OB/GYN or reproductive endocrinologist.'
  },
  {
    id: 'phenotypes',
    category: 'Phenotypes',
    keywords: ['phenotype', 'types', 'phenotypes', 'type a', 'type b', 'type c', 'type d', 'lean pcos'],
    title: 'The 4 Clinical Phenotypes of PCOS',
    plainEnglishSummary: 'PCOS is not one-size-fits-all. It manifests in 4 clinical types ranging from Phenotype A (all symptoms present) to Phenotype D (irregular periods and polycystic ovaries without high male hormones). Lean women can also have PCOS (often Phenotype C or D).',
    clinicalDetails: 'Phenotype A (Full/Classic): Hyperandrogenism + Ovulatory Dysfunction + PCOM; Phenotype B (Classic Non-PCO): Hyperandrogenism + Ovulatory Dysfunction; Phenotype C (Ovulatory): Hyperandrogenism + PCOM with regular menses; Phenotype D (Non-hyperandrogenic): Ovulatory Dysfunction + PCOM without high androgens.',
    actionableAdvice: 'Understanding your specific phenotype helps tailor treatment: for example, Phenotype D focuses on ovulatory restoration rather than anti-androgens.'
  },
  {
    id: 'follicle_count',
    category: 'Biomarkers',
    keywords: ['follicle', 'follicles', 'ultrasound', 'pelvic scan', 'ovary', 'ovarian cysts', 'pearls'],
    title: 'Antral Follicle Count (Ultrasound)',
    plainEnglishSummary: 'In ultrasound scans, doctors count tiny immature egg sacs (follicles). In PCOS, because ovulation is delayed, many small follicles (often 12 to 20+ per ovary) accumulate around the edge of the ovary like a "string of pearls".',
    clinicalDetails: 'Per updated ESHRE guidelines (using modern high-frequency transvaginal ultrasound >=8 MHz), PCOM is defined as >=20 follicles per ovary or ovarian volume >=10 mL. In transabdominal imaging, threshold is >=12 follicles or volume >=10 mL.',
    normalRange: 'Typically 4 to 10 follicles per ovary in reproductive-age females.',
    pcosPattern: 'Frequently >12 to 25+ follicles per ovary with peripheral distribution and dense central stroma.',
    actionableAdvice: 'Follicles are immature egg pockets, NOT dangerous cancerous cysts. They can fluctuate over time and with metabolic improvements.'
  },
  {
    id: 'cycle_regularity',
    category: 'Symptoms',
    keywords: ['cycle', 'period', 'irregular', 'amenorrhea', 'oligomenorrhea', 'menstrual', 'bleeding', 'days'],
    title: 'Menstrual Cycle Regularity & Length',
    plainEnglishSummary: 'A normal menstrual cycle typically ranges between 21 and 35 days. In PCOS, delayed or absent ovulation often causes cycles longer than 35 days (oligomenorrhea) or periods that disappear for months (amenorrhea).',
    clinicalDetails: 'Ovulatory dysfunction is characterized by cycle intervals >35 days or <21 days, or fewer than 8 cycles per year. Unopposed estrogen due to chronic anovulation can lead to endometrial hyperplasia if left unmanaged.',
    normalRange: '21 to 35 days, with 3 to 7 days of bleeding.',
    pcosPattern: 'Variable cycles >35 days, unpredictable spotting, or prolonged gaps without periods.',
    actionableAdvice: 'Track cycle lengths on a calendar. If you go >90 days without a period, consult your gynecologist to protect the endometrial lining.'
  },
  {
    id: 'amh',
    category: 'Biomarkers',
    keywords: ['amh', 'anti-mullerian hormone', 'ovarian reserve', 'egg count'],
    title: 'Anti-Müllerian Hormone (AMH)',
    plainEnglishSummary: 'AMH is a hormone produced by the small growing follicles in the ovaries. Because women with PCOS have many more active small follicles, their AMH blood levels are often 2 to 4 times higher than average.',
    clinicalDetails: 'AMH reflects the pool of growing preantral and small antral follicles. While high AMH correlates strongly with PCOM and PCOS severity, international guidelines recommend AMH as an adjunctive marker alongside ultrasound and clinical features.',
    normalRange: '1.0 to 3.5 ng/mL (reproductive age).',
    pcosPattern: 'Often >4.5 to 10.0+ ng/mL.',
    actionableAdvice: 'High AMH does not mean permanent infertility—it indicates a large reserve of eggs that need hormonal balance to trigger mature ovulation.'
  },
  {
    id: 'lh_fsh_ratio',
    category: 'Biomarkers',
    keywords: ['lh', 'fsh', 'luteinizing', 'follicle stimulating', 'ratio', 'gonadotropin'],
    title: 'LH to FSH Ratio',
    plainEnglishSummary: 'LH (Luteinizing Hormone) triggers ovulation, while FSH (Follicle-Stimulating Hormone) helps eggs grow. In women without PCOS, LH and FSH are roughly equal (1:1). In PCOS, the pituitary gland often releases excessive LH, creating an LH:FSH ratio of 2:1 or even 3:1.',
    clinicalDetails: 'Pulsatile GnRH frequency is elevated in PCOS, preferentializing pituitary LH secretion over FSH. Elevated LH stimulates the ovarian theca cells to synthesize excess androgens (testosterone and androstenedione).',
    normalRange: 'LH:FSH ratio ~ 1.0 : 1.0 (tested on Day 2-4 of cycle).',
    pcosPattern: 'LH:FSH ratio > 2.0 or 3.0.',
    actionableAdvice: 'Hormone blood tests are most informative when drawn on cycle Days 2 to 4 (early follicular phase).'
  },
  {
    id: 'insulin_resistance',
    category: 'Lifestyle & Diet',
    keywords: ['insulin', 'glucose', 'fasting blood sugar', 'metabolism', 'cravings', 'sugar', 'acanthosis', 'skin darkening'],
    title: 'Insulin Resistance & Skin Darkening (Acanthosis Nigricans)',
    plainEnglishSummary: 'Up to 70-80% of women with PCOS have insulin resistance: their cells do not respond efficiently to insulin, causing the pancreas to pump out extra insulin. Excess insulin triggers the ovaries to produce more male hormones and can cause velvety dark skin patches in creases (acanthosis nigricans).',
    clinicalDetails: 'Hyperinsulinemia acts synergistically with LH on ovarian theca cells to upregulate CYP17A1 enzyme activity, driving androgen overproduction. It also lowers hepatic Sex Hormone-Binding Globulin (SHBG), increasing free bioavailable testosterone.',
    normalRange: 'Fasting glucose < 99 mg/dL; Fasting insulin < 10-12 uIU/mL; HOMA-IR < 2.0.',
    pcosPattern: 'Fasting glucose > 100 mg/dL, elevated fasting insulin, or HOMA-IR > 2.5.',
    actionableAdvice: 'Pair carbohydrates with protein and fiber (e.g., oats with chia seeds and walnuts) to blunt insulin spikes. 20-30 mins of daily walking significantly boosts insulin sensitivity.'
  },
  {
    id: 'hirsutism_androgens',
    category: 'Symptoms',
    keywords: ['hirsutism', 'hair growth', 'facial hair', 'chin hair', 'acne', 'alopecia', 'hair loss', 'testosterone', 'androgens'],
    title: 'Hirsutism, Acne & Androgen Excess',
    plainEnglishSummary: 'Androgens are hormones present in all bodies, but elevated levels in women can cause coarse, dark hair growth in male-pattern areas (chin, upper lip, chest, abdomen), persistent cystic acne around the jawline, or thinning scalp hair.',
    clinicalDetails: 'Clinical assessment uses the Modified Ferriman-Gallwey (mFG) score (>=4-6 depending on ethnicity). Biochemical markers include elevated total testosterone, free testosterone index (FTI), DHEA-S, and androstenedione.',
    actionableAdvice: 'Anti-androgenic therapies, spironolactone, combined oral contraceptives, spearmint tea, and inositol can be evaluated with your clinician.'
  },
  {
    id: 'diet_lifestyle',
    category: 'Lifestyle & Diet',
    keywords: ['diet', 'food', 'nutrition', 'exercise', 'weight', 'supplements', 'inositol', 'fast food'],
    title: 'Evidence-Based Nutrition & Movement for PCOS',
    plainEnglishSummary: 'There is no single "magic diet", but a Mediterranean-style, low-glycemic, anti-inflammatory dietary pattern rich in colorful vegetables, lean proteins, omega-3 fats, and whole grains significantly improves insulin sensitivity and restores ovulation.',
    clinicalDetails: 'Studies show that a 5-10% reduction in total body weight in overweight individuals or improving body composition in lean PCOS restores regular ovulatory cycles in over 50% of patients. Inositol (Myo-inositol to D-chiro-inositol in a 40:1 ratio) improves ovulatory rates and metabolic markers.',
    actionableAdvice: 'Aim for a 40:1 Myo-inositol supplement (2000mg twice daily), prioritize strength/resistance training 3x weekly, and minimize ultra-processed high-sugar fast foods.'
  },
  {
    id: 'doctor_discussion',
    category: 'Medical Workup',
    keywords: ['doctor', 'gynecologist', 'endocrinologist', 'questions', 'what to ask', 'tests', 'workup', 'appointment'],
    title: 'What to Ask Your Healthcare Provider',
    plainEnglishSummary: 'Preparing clear questions empowers you at your doctor appointment. Bring your cycle tracking logs, list your key symptoms (hair changes, skin changes, cycle gaps), and ask about comprehensive blood work and a pelvic ultrasound.',
    clinicalDetails: 'Standard diagnostic workup includes: Pelvic ultrasound (PCOM evaluation), early follicular phase hormones (Day 2-4: FSH, LH, Estradiol, Total/Free Testosterone, DHEA-S, Prolactin, TSH to exclude thyroid disorders), and metabolic panel (Fasting Glucose, Lipid Profile, HbA1c or 2-hour OGTT).',
    actionableAdvice: 'Ask: 1) "Can we test my fasting glucose/insulin and lipid panel?", 2) "Could we check my hormone levels on Day 3 of my next cycle?", 3) "What lifestyle or medical options match my current goals (cycle regulation, symptom control, or fertility)?"'
  }
];

/**
 * Intelligent Keyword & Semantic-Match Retrieval for PCOS Questions
 */
export function queryKnowledgeBase(query: string): KnowledgeTopic[] {
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,?.!]+/).filter(t => t.length > 2);

  const scored = PCOS_KNOWLEDGE_BASE.map(topic => {
    let score = 0;
    
    // Keyword match
    for (const kw of topic.keywords || []) {
      const kwLower = (kw || '').toLowerCase();
      if (cleanQuery.includes(kwLower)) {
        score += 5;
      }
      for (const tok of queryTokens) {
        if (kwLower.includes(tok)) {
          score += 2;
        }
      }
    }

    // Title match
    if ((topic.title || '').toLowerCase().includes(cleanQuery)) {
      score += 8;
    }

    // Content match
    for (const tok of queryTokens) {
      if ((topic.plainEnglishSummary || '').toLowerCase().includes(tok)) score += 1;
      if ((topic.clinicalDetails || '').toLowerCase().includes(tok)) score += 1;
    }

    return { topic, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter(s => s.score > 0).map(s => s.topic);

  // Default to top 3 or default general topics
  return relevant.length > 0 ? relevant.slice(0, 3) : [PCOS_KNOWLEDGE_BASE[0], PCOS_KNOWLEDGE_BASE[1], PCOS_KNOWLEDGE_BASE[6]];
}

/**
 * Generate a comprehensive contextual answer using RAG knowledge base
 */
export function generateLocalRAGResponse(query: string, patientContext?: any): {
  answer: string;
  matchedTopics: KnowledgeTopic[];
  suggestedQuestions: string[];
} {
  const matched = queryKnowledgeBase(query);
  const top = matched[0] || PCOS_KNOWLEDGE_BASE[0];

  let contextSnippet = '';
  if (patientContext) {
    const risk = patientContext.risk_level || 'Evaluated';
    const prob = patientContext.probability || patientContext.probabilityPercentage;
    const cycle = patientContext.patientData?.['Cycle(R/I)'] === 2 ? 'regular' : 'irregular';
    const bmi = patientContext.patientData?.['BMI'] || 'N/A';
    
    contextSnippet = `\n\n**Based on your current assessment context:**\n` +
      `- Estimated Risk Level: **${risk}** (${prob ? prob + '%' : 'Calculated'})\n` +
      `- Reported Menstrual Pattern: **${cycle}**\n` +
      `- Calculated BMI: **${bmi}**\n`;
  }

  const answer = `### ${top.title}

**In Plain Language:**
${top.plainEnglishSummary}

**Clinical & Biological Context:**
${top.clinicalDetails}
${top.normalRange ? `\n- **Typical Reference Range:** ${top.normalRange}` : ''}
${top.pcosPattern ? `\n- **Pattern Often Seen in PCOS:** ${top.pcosPattern}` : ''}

**Actionable Next Steps:**
${top.actionableAdvice}
${contextSnippet}
---
*Disclaimer: PCOSense provides evidence-based health awareness and machine learning risk estimation. It does not replace a clinical examination by a certified physician.*`;

  const suggestedQuestions = [
    'What do the Rotterdam criteria require for diagnosis?',
    'Why is my LH/FSH ratio important?',
    'How does insulin resistance trigger high androgens?',
    'What should I ask my doctor during my next visit?',
    'What lifestyle changes have the strongest scientific evidence?'
  ];

  return {
    answer,
    matchedTopics: matched,
    suggestedQuestions: suggestedQuestions.filter(q => q.toLowerCase() !== query.toLowerCase()).slice(0, 3)
  };
}
