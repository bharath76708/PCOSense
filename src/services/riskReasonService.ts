/**
 * Personalized Risk Reasons & Mechanistic Attribution Service
 * Analyzes individual patient parameters to explain WHY they are at risk,
 * the exact biological mechanisms, and targeted dietary interventions.
 */

import { PatientRecord, PredictionResponse, PersonalizedRiskReason } from '../types';

export function extractPersonalizedRiskReasons(
  patientData: Partial<PatientRecord>,
  prediction?: PredictionResponse | null
): PersonalizedRiskReason[] {
  const reasons: PersonalizedRiskReason[] = [];

  // 1. Menstrual Irregularity & Cycle Length (Oligo/Anovulation)
  const isIrregular = patientData['Cycle(R/I)'] === 4 || (patientData['Cycle(R/I)'] !== undefined && patientData['Cycle(R/I)'] !== 2);
  const cycleDays = patientData['Cycle length(days)'] || 28;

  if (isIrregular || cycleDays > 35 || cycleDays < 21) {
    reasons.push({
      id: 'cycle_irregularity',
      category: 'menstrual',
      title: 'Menstrual Irregularity & Delayed Ovulation (Oligomenorrhea)',
      titleTe: 'ఋతుస్రావ క్రమరాహిత్యం & ఆలస్యమైన అండోత్పత్తి',
      reportedValue: isIrregular ? `Irregular / Interval: ${cycleDays} days` : `${cycleDays} days`,
      healthyBenchmark: 'Regular every 21–35 days (eumenorrhea)',
      severity: cycleDays > 45 || isIrregular ? 'high' : 'moderate',
      whyItsARisk:
        'When your menstrual cycle is longer than 35 days or highly unpredictable, it indicates that mature egg follicles are failing to rupture and release on schedule (oligo-anovulation). Without regular ovulation, your body does not produce sufficient progesterone in the second half of your cycle, leading to unopposed estrogen, thickened uterine lining, and hormonal chaos.',
      whyItsARiskTe:
        'మీ పీరియడ్స్ చక్రం 35 రోజుల కంటే ఎక్కువ లేదా క్రమం తప్పినప్పుడు, అండాశయంలోని ఫోలికల్స్ సకాలంలో పరిపక్వం చెంది అండం విడుదల కాలేకపోతున్నాయని అర్థం. సరైన అండోత్పత్తి జరగకపోవడం వల్ల ప్రొజెస్టెరాన్ లోపం మరియు ఈస్ట్రోజెన్ అసమతుల్యత ఏర్పడతాయి.',
      biologicalMechanism:
        'Disrupted GnRH pulsatility creates an elevated LH-to-FSH ratio, halting follicular maturation at 5–8mm antral stages and preventing the mid-cycle LH surge necessary for rupture.',
      biologicalMechanismTe:
        'హైపోథాలమస్ నుండి వచ్చే హార్మోన్ల హెచ్చుతగ్గుల వల్ల LH మరియు FSH నిష్పత్తి అసమతుల్యమై, అండం విడుదల కావడానికి అవసరమైన LH సర్జ్ నిరోధించబడుతుంది.',
      dietaryAction:
        'Focus on seed cycling (Flaxseeds + Pumpkin seeds in follicular phase, Sunflower + Sesame in luteal phase) and healthy fats to support follicle cell membrane elasticity and progesterone synthesis.',
      dietaryActionTe:
        'సీడ్ సైక్లింగ్ (మొదటి 14 రోజులు అవిసె గింజలు + గుమ్మడి గింజలు, తర్వాత పొద్దుతిరుగుడు + నువ్వులు) మరియు ఆరోగ్యకరమైన ఒమేగా-3 కొవ్వులను ఆహారంలో చేర్చుకోండి.',
      keyNutrients: ['Lignans', 'Omega-3 Fatty Acids', 'Vitamin B6', 'Zinc']
    });
  }

  // 2. Fast Food & High Glycemic Diet (Insulin Resistance Driver)
  if (patientData['Fast food (Y/N)'] === 1) {
    reasons.push({
      id: 'fast_food_diet',
      category: 'lifestyle',
      title: 'Frequent Ultra-Processed / High-Glycemic Food Consumption',
      titleTe: 'ప్రాసెస్ చేసిన లేదా అధిక గ్లైసెమిక్ ఆహారాల వినియోగం',
      reportedValue: 'Yes (Frequent intake reported)',
      healthyBenchmark: 'Whole, unrefined, low-GI meals (<10% processed items)',
      severity: 'high',
      whyItsARisk:
        'Refined flours, sugars, trans fats, and fast foods cause rapid spikes in blood glucose. Your pancreas responds by releasing massive surges of insulin. In PCOS, high circulating insulin acts directly on the ovaries to supercharge androgen (male hormone) production and lowers Sex Hormone-Binding Globulin (SHBG), causing free testosterone to circulate freely.',
      whyItsARiskTe:
        'ప్రాసెస్ చేసిన ఆహారాలు మరియు చక్కెరలు రక్తంలో గ్లూకోజ్‌ను వేగంగా పెంచుతాయి. దీంతో ఇన్సులిన్ అధికంగా విడుదలై, అండాశయాలలో టెస్టోస్టెరాన్ హార్మోన్‌ను అధికంగా ఉత్పత్తి చేయమని ప్రేరేపిస్తుంది.',
      biologicalMechanism:
        'Hyperinsulinemia stimulates ovarian theca cell CYP17A1 enzyme activity (increasing testosterone) while concurrently suppressing hepatic SHBG transcription.',
      biologicalMechanismTe:
        'అధిక ఇన్సులిన్ అండాశయ తీకా కణాలను నేరుగా ఉత్తేజపరిచి టెస్టోస్టెరాన్‌ను పెంచుతుంది మరియు కాలేయంలో SHBG ప్రొటీన్‌ను తగ్గిస్తుంది.',
      dietaryAction:
        'Switch immediately to fiber-dense complex carbohydrates (millet, quinoa, legumes), pair every carb with clean protein and healthy fat, and consume 1 tbsp apple cider vinegar or fenugreek water before main meals.',
      dietaryActionTe:
        'తక్కువ గ్లైసెమిక్ ఇండెక్స్ కలిగిన చిరుధాన్యాలు (మిల్లెట్స్), పప్పుధాన్యాలు, మెంతి నీరు మరియు పీచు పదార్థాలను ప్రతి భోజనంలో మొదట తినండి.',
      keyNutrients: ['Inositol (Myo/D-Chiro)', 'Chromium', 'Soluble Fiber', 'Magnesium']
    });
  }

  // 3. Low Physical Activity / Sedentary Routine
  if (patientData['Reg.Exercise(Y/N)'] === 0) {
    reasons.push({
      id: 'sedentary_lifestyle',
      category: 'lifestyle',
      title: 'Sedentary Lifestyle / Suboptimal Muscle Glucose Uptake',
      titleTe: 'శారీరక వ్యాయామ లోపం / జీవక్రియ మందగించడం',
      reportedValue: 'Sedentary (No regular structured workout)',
      healthyBenchmark: '≥150 min/week moderate resistance or brisk cardio',
      severity: 'moderate',
      whyItsARisk:
        'Skeletal muscle is responsible for over 80% of whole-body glucose clearance. Without regular muscular contractions, GLUT4 glucose transporters stay dormant, forcing your body into a state of insulin resistance, chronic low-grade inflammation, and sluggish basal metabolic rate.',
      whyItsARiskTe:
        'మన శరీరంలోని 80% కంటే ఎక్కువ గ్లూకోజ్ కండరాల ద్వారా వినియోగించబడుతుంది. వ్యాయామం లేకపోతే ఇన్సులిన్ రెసిస్టెన్స్ పెరిగి జీవక్రియ మందగిస్తుంది.',
      biologicalMechanism:
        'Lack of muscle contraction diminishes AMPK activation and downregulates GLUT4 translocation to the plasma membrane independent of insulin.',
      biologicalMechanismTe:
        'కండరాల సంకోచాలు లేకపోవడం వల్ల కణాలలో గ్లూకోజ్ రవాణా చేసే GLUT4 ప్రోటీన్ల పనితీరు మందగిస్తుంది.',
      dietaryAction:
        'Incorporate pre-workout energizing green tea / matcha with lemon and post-meal 10-minute gentle walks to utilize non-insulin-mediated glucose uptake.',
      dietaryActionTe:
        'ప్రతి భోజనం తర్వాత 10-15 నిమిషాల నడకను అలవాటు చేసుకోండి మరియు యాంటీఆక్సిడెంట్లు అధికంగా ఉండే గ్రీన్ టీని తీసుకోండి.',
      keyNutrients: ['CoQ10', 'L-Carnitine', 'Polyphenols', 'Electrolytes']
    });
  }

  // 4. Elevated BMI and Visceral Adiposity (Waist:Hip Ratio)
  const bmi = patientData['BMI'] || 0;
  const whr = patientData['Waist:Hip Ratio'] || 0;
  const hasWeightGain = patientData['Weight gain(Y/N)'] === 1;

  if (bmi >= 25 || whr >= 0.85 || hasWeightGain) {
    reasons.push({
      id: 'metabolic_adiposity',
      category: 'metabolic',
      title: 'Central Adiposity & Elevated Visceral Inflammation',
      titleTe: 'పొత్తికడుపు కొవ్వు & జీవక్రియ వాపు (Visceral Adiposity)',
      reportedValue: `BMI: ${bmi > 0 ? `${bmi} kg/m²` : 'Elevated'}, W:H Ratio: ${whr > 0 ? whr : 'High'}${hasWeightGain ? ' (Weight gain reported)' : ''}`,
      healthyBenchmark: 'BMI: 18.5–24.9 kg/m², Waist:Hip Ratio < 0.80',
      severity: bmi >= 28 || whr >= 0.88 ? 'high' : 'moderate',
      whyItsARisk:
        'Fat stored around the abdominal midsection (visceral adipose tissue) is biologically active endocrine tissue. It continuously secretes inflammatory cytokines (TNF-alpha, IL-6) that worsen insulin resistance and convert circulating androgens into estrogens, driving hormonal dysregulation.',
      whyItsARiskTe:
        'నడుము చుట్టూ పేరుకుపోయే కొవ్వు కణాలు సైటోకైన్స్ అనే హానికరమైన వాపు కారకాలను విడుదల చేసి ఇన్సులిన్ నిరోధకతను మరియు హార్మోన్ల అసమతుల్యతను రెట్టింపు చేస్తాయి.',
      biologicalMechanism:
        'Visceral adipocytes exhibit enhanced lipolysis, releasing free fatty acids directly into the portal circulation, inducing hepatic insulin resistance and systemic inflammation.',
      biologicalMechanismTe:
        'విసెరల్ కొవ్వు కణాలు కాలేయానికి ఫ్రీ ఫ్యాటీ యాసిడ్లను విడుదల చేసి కాలేయంలో ఇన్సులిన్ రెసిస్టెన్స్ మరియు సిస్టమిక్ ఇన్ఫ్లమేషన్‌ను ప్రేరేపిస్తాయి.',
      dietaryAction:
        'Adopt an anti-inflammatory Mediterranean/DASH-style plate with turmeric, ginger, extra virgin olive oil, cruciferous vegetables (broccoli, cabbage for estrogen detoxification), and at least 35g of daily prebiotic fiber.',
      dietaryActionTe:
        'పసుపు, అల్లం, ఆలివ్ ఆయిల్, బ్రకోలి, ఆకుకూరలు మరియు అధిక పీచు ఉండే ఆహారాన్ని ఎంచుకోండి.',
      keyNutrients: ['Sulforaphane', 'Curcumin', 'Omega-3 (EPA/DHA)', 'DIM (Diindolylmethane)']
    });
  }

  // 5. Androgenic Symptoms (Hirsutism, Acne, Hair Loss)
  const hasHirsutism = patientData['hair growth(Y/N)'] === 1;
  const hasAcne = patientData['Pimples(Y/N)'] === 1;
  const hasHairLoss = patientData['Hair loss(Y/N)'] === 1;

  if (hasHirsutism || hasAcne || hasHairLoss) {
    const signs = [];
    if (hasHirsutism) signs.push('Excess Facial/Body Hair');
    if (hasAcne) signs.push('Cystic Acne / Breakouts');
    if (hasHairLoss) signs.push('Androgenic Scalp Hair Thinning');

    reasons.push({
      id: 'hyperandrogenism_signs',
      category: 'androgenic',
      title: 'Clinical Hyperandrogenism (Elevated Active Androgen Metabolites)',
      titleTe: 'క్లినికల్ హైపర్‌ఆండ్రోజెనిజం (అధిక పురుష హార్మోన్ల ప్రభావం)',
      reportedValue: signs.join(', '),
      healthyBenchmark: 'Absence of androgen-dependent hirsutism or severe acne',
      severity: signs.length >= 2 ? 'high' : 'moderate',
      whyItsARisk:
        'The presence of chin/jawline hair, persistent hormonal acne, or crown hair shedding occurs when testosterone is converted into its 5x more potent derivative, Dihydrotestosterone (DHT), by the enzyme 5-alpha reductase in hair follicles and sebaceous glands.',
      whyItsARiskTe:
        'గడ్డంపై అవాంఛిత రోమాలు, మొటిమలు లేదా జుట్టు రాలడం అనేవి టెస్టోస్టెరాన్ హార్మోన్ DHT గా మారడం వల్ల మరియు అండాశయాలలో ఆండ్రోజెన్లు అధికంగా ఉత్పత్తి కావడం వల్ల సంభవిస్తాయి.',
      biologicalMechanism:
        'Excess LH and insulin drive ovarian and adrenal DHEA-S/androstenedione production, which acts on cutaneous androgen receptors to induce sebum hypersecretion and miniaturize scalp follicles.',
      biologicalMechanismTe:
        'అధిక LH మరియు ఇన్సులిన్ అండాశయాలను ఉత్తేజపరిచి టెస్టోస్టెరాన్‌ను చర్మ గ్రంధులలో అధిక నూనె ఉత్పత్తికి మరియు రోమకూపాల మార్పులకు కారణమవుతాయి.',
      dietaryAction:
        'Drink 2 cups of organic Spearmint Tea daily (clinically proven to lower free testosterone and reduce hirsutism scores), consume zinc-rich pumpkin seeds, and drink green tea with EGCG.',
      dietaryActionTe:
        'రోజుకు 2 కప్పుల స్పియర్‌మింట్ (పుదీనా జాతి) టీ తాగడం క్లినికల్ పరిశోధనలలో టెస్టోస్టెరాన్‌ను తగ్గించడంలో నిరూపించబడింది. జింక్ అధికంగా ఉండే గుమ్మడి గింజలను తీసుకోండి.',
      keyNutrients: ['Spearmint Polyphenols', 'Zinc', 'Saw Palmetto Extracts', 'EGCG']
    });
  }

  // 6. Skin Darkening / Acanthosis Nigricans (Hallmark of Insulin Resistance)
  if (patientData['Skin darkening (Y/N)'] === 1) {
    reasons.push({
      id: 'acanthosis_nigricans',
      category: 'metabolic',
      title: 'Acanthosis Nigricans (Severe Peripheral Insulin Resistance Marker)',
      titleTe: 'అకాంథోసిస్ నిగ్రికాన్స్ (మెడ/చంకల వద్ద చర్మం నల్లబడటం)',
      reportedValue: 'Present (Dark velvety patches on neck/folds)',
      healthyBenchmark: 'Clear, uniform skin pigmentation in body folds',
      severity: 'high',
      whyItsARisk:
        'Darkened, velvety patches on the back of the neck, armpits, or knuckles are a direct cutaneous indicator of elevated insulin. Excess insulin crosses into dermal tissue and binds to IGF-1 (Insulin-like Growth Factor) receptors, causing rapid over-proliferation of epidermal keratinocytes and melanocytes.',
      whyItsARiskTe:
        'మెడ వెనుక లేదా చంకల వద్ద చర్మం నల్లబడటం అనేది శరీరంలో ఇన్సులిన్ స్థాయిలు చాలా ఎక్కువగా ఉన్నాయని సూచించే ఒక బలమైన ప్రత్యక్ష వైద్య సంకేతం.',
      biologicalMechanism:
        'Supra-physiological insulin levels bind with low affinity to IGF-1 receptors on dermal fibroblasts and keratinocytes, stimulating excessive cellular proliferation.',
      biologicalMechanismTe:
        'రక్తంలోని అధిక ఇన్సులిన్ చర్మ కణాలలోని IGF-1 రిసెప్టార్లతో బంధించి చర్మ కణాలు మరియు మెలనిన్ ఉత్పత్తిని వేగవంతం చేస్తుంది.',
      dietaryAction:
        'Adopt strict Low-Glycemic Index (GI < 55) nutritional protocol. Replace all white rice and maida with foxtail/barnyard millets, chickpeas, and chia seeds. Include 1/2 tsp Ceylon cinnamon daily.',
      dietaryActionTe:
        'పూర్తిగా తక్కువ గ్లైసెమిక్ ఇండెక్స్ ఆహారాలను పాటించండి. తెల్ల బియ్యానికి బదులు కొర్రలు, సాములు, శనగలు మరియు దాల్చిన చెక్క పొడిని ఆహారంలో వాడండి.',
      keyNutrients: ['Ceylon Cinnamon (Cinnamaldehyde)', 'Berberine Sources', 'Alpha Lipoic Acid', 'Chromium']
    });
  }

  // 7. Biomarkers (AMH, LH/FSH, RBS if present in assessment)
  const amh = patientData['AMH(ng/mL)'];
  const rbs = patientData['RBS(mg/dl)'];
  const lhFsh = patientData['FSH/LH'];

  if (amh && amh > 4.5) {
    reasons.push({
      id: 'elevated_amh',
      category: 'biomarker',
      title: 'Elevated Anti-Müllerian Hormone (High Antral Follicle Reserve)',
      titleTe: 'అధిక AMH స్థాయి (అధిక ఫోలికల్ నిల్వ & పరిపక్వత నిరోధం)',
      reportedValue: `${amh} ng/mL`,
      healthyBenchmark: '1.5 – 4.0 ng/mL',
      severity: amh > 7.0 ? 'high' : 'moderate',
      whyItsARisk:
        'AMH is produced by the granulosa cells of small growing follicles. In PCOS, an abundance of arrested 2–9mm follicles produces 2–4 times more AMH than normal. This excess AMH actively suppresses FSH sensitivity, creating a vicious cycle where follicles cannot mature or ovulate.',
      whyItsARiskTe:
        'అండాశయంలో విడుదల కాకుండా ఆగిపోయిన చిన్న ఫోలికల్స్ వల్ల AMH హార్మోన్ అధికంగా ఉత్పత్తి అవుతుంది. ఇది ఆరోగ్యకరమైన అండోత్పత్తిని నిరోధిస్తుంది.',
      biologicalMechanism:
        'Elevated AMH inhibits the recruitment of primordial follicles and downregulates ovarian aromatase enzyme expression, preventing estrogen production needed for dominant follicle selection.',
      biologicalMechanismTe:
        'అధిక AMH అరోమాటేజ్ ఎంజైమ్ పనితీరును అణచివేసి, ఒక ప్రధాన అండం పరిపక్వం చెందకుండా నిరోధిస్తుంది.',
      dietaryAction:
        'Incorporate high-antioxidant berries (blueberries, raspberries), Vitamin D3-rich foods or supplementation, and CoQ10 to protect follicle oocyte mitochondrial quality.',
      dietaryActionTe:
        'యాంటీఆక్సిడెంట్లు అధికంగా ఉండే పండ్లు, విటమిన్ డి3 అధికంగా ఉండే ఆహారాలు మరియు ఒమేగా-3 కొవ్వులను క్రమం తప్పకుండా తీసుకోండి.',
      keyNutrients: ['CoQ10', 'Vitamin D3', 'Anthocyanins', 'Resveratrol']
    });
  }

  if (rbs && rbs > 110) {
    reasons.push({
      id: 'elevated_glucose',
      category: 'biomarker',
      title: 'Elevated Random Blood Sugar (Impaired Glucose Tolerance)',
      titleTe: 'రక్తంలో పెరిగిన గ్లూకోజ్ స్థాయిలు (ఇన్సులిన్ అసమతుల్యత)',
      reportedValue: `${rbs} mg/dL`,
      healthyBenchmark: '< 100 mg/dL (fasting) / < 140 mg/dL (random)',
      severity: rbs > 125 ? 'high' : 'moderate',
      whyItsARisk:
        'Elevated blood sugar confirms systemic insulin resistance. When glucose remains in the bloodstream instead of fueling cells, it leads to fatigue, sugar cravings, hormonal dysfunction, and long-term risk of Type 2 Diabetes.',
      whyItsARiskTe:
        'రక్తంలో పెరిగిన గ్లూకోజ్ శరీరంలో ఇన్సులిన్ సరైన రీతిలో పనిచేయడం లేదని మరియు జీవక్రియ ఒత్తిడిని సూచిస్తుంది.',
      biologicalMechanism:
        'Glucotoxicity and advanced glycation end-products (AGEs) induce ovarian stromal oxidative stress, exacerbating theca cell steroidogenesis.',
      biologicalMechanismTe:
        'గ్లూకోజ్ టాక్సిసిటీ అండాశయ కణజాలంలో ఆక్సిడేటివ్ ఒత్తిడిని పెంచి హార్మోన్ల అసమతుల్యతను తీవ్రతరం చేస్తుంది.',
      dietaryAction:
        'Implement "Clothing your Carbs" rule: never eat carbohydrates alone. Always pair with protein, fiber, and healthy fat. Drink fenugreek water every morning.',
      dietaryActionTe:
        'పిండి పదార్థాలను ఎప్పుడూ ఒంటరిగా తినవద్దు. వాటిని ఎల్లప్పుడూ ప్రొటీన్ మరియు పీచు పదార్థాలతో కలిపి తినండి. ఉదయం మెంతి నీరు తాగండి.',
      keyNutrients: ['Fenugreek Trigonelline', 'Myo-Inositol', 'Magnesium Glycinate', 'Chromium']
    });
  }

  // If no specific risk factors flagged, provide foundational health reasons
  if (reasons.length === 0) {
    reasons.push({
      id: 'general_hormone_balance',
      category: 'lifestyle',
      title: 'Optimal Baseline Profile / Preventive Maintenance',
      titleTe: 'సాధారణ ఆరోగ్య స్థితి / ముందస్తు నివారణ సంరక్షణ',
      reportedValue: 'Within Standard Clinical Ranges',
      healthyBenchmark: 'Balanced Metabolic & Ovulatory Parameters',
      severity: 'mild',
      whyItsARisk:
        'Your profile reflects well-balanced biomarkers with low immediate statistical risk. However, sustaining balanced blood sugar, consistent ovulation, and low inflammation through nutrient-rich eating remains vital to safeguard lifelong endocrine health.',
      whyItsARiskTe:
        'మీ ఫలితాలు ప్రస్తుతం ఆరోగ్యకరమైన సమతుల్యతను సూచిస్తున్నాయి. భవిష్యత్తులో కూడా హార్మోన్లు సమతుల్యంగా ఉండటానికి పోషకాహార జీవనశైలిని కొనసాగించండి.',
      biologicalMechanism:
        'Balanced LH/FSH pulses maintain cyclical follicular maturation, supporting physiological progesterone secretion and metabolic equilibrium.',
      biologicalMechanismTe:
        'సమతుల్య హార్మోన్లు ప్రతి నెలా సక్రమమైన అండోత్పత్తిని మరియు సరైన జీవక్రియను కాపాడతాయి.',
      dietaryAction:
        'Maintain a nutrient-dense whole-food diet rich in antioxidants, diverse colorful vegetables, clean proteins, and regular hydration.',
      dietaryActionTe:
        'రంగురంగుల కూరగాయలు, తృణధాన్యాలు, సరిపడా నీరు మరియు శుభ్రమైన ప్రొటీన్ ఆహారాన్ని కొనసాగించండి.',
      keyNutrients: ['Zinc', 'Vitamin D3', 'Magnesium', 'Fiber']
    });
  }

  return reasons;
}
