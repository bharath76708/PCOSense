/**
 * PCOSense - AI Food Scanner & Glycemic Index Service
 * Communicates with server-side Gemini 3.8 Flash endpoint and manages scan history
 */

import { FoodScanResult, FoodRiskEstimation, FoodRiskLevel } from '../types';

const STORAGE_KEY = 'pcosense_scanned_food_history';

/**
 * Calculates a nuanced, clinically calibrated Food Risk Estimation based on
 * portion-adjusted Glycemic Load (GL), dietary fiber buffer, protein satiety, and net carbs.
 * This prevents ordinary, wholesome everyday meals from being falsely labeled as "High Risk".
 */
export function calculateFoodRiskEstimation(scan: Partial<FoodScanResult>): FoodRiskEstimation {
  // If scan already provides an explicit, calibrated foodRisk, return it
  if (scan.foodRisk && scan.foodRisk.riskLevel && typeof scan.foodRisk.riskScore === 'number') {
    return scan.foodRisk;
  }

  const nutrition = scan.estimatedNutrition;
  const carbs = nutrition?.carbsG ?? 38;
  const fiber = nutrition?.fiberG ?? 6;
  const protein = nutrition?.proteinG ?? 14;
  const netCarbs = nutrition?.netCarbsG ?? Math.max(0, carbs - fiber);
  const fat = nutrition?.fatG ?? 10;
  const gl = scan.glycemicIndex?.glycemicLoad ?? 'Low';
  const pcosScore = scan.pcosSuitability?.score ?? 7;

  // Base score calibrated from Glycemic Load (GL) & Net Carbs
  let score = 25; // default low baseline

  if (gl === 'Low' || netCarbs <= 24) {
    score = 20;
  } else if (gl === 'Medium' || (netCarbs > 24 && netCarbs <= 45)) {
    score = 42;
  } else {
    // High GL or heavy net carbs
    score = 68;
  }

  // Fiber protection (Fiber forms a viscous matrix that flattens postprandial glucose curves)
  if (fiber >= 8) {
    score -= 15;
  } else if (fiber >= 5) {
    score -= 10;
  } else if (fiber < 2.5) {
    score += 15;
  }

  // Protein protection (Satiety hormone stimulation & non-insulin-mediated glucose disposal)
  if (protein >= 18) {
    score -= 14;
  } else if (protein >= 12) {
    score -= 8;
  } else if (protein < 4) {
    score += 10;
  }

  // Healthy fat buffer (slows gastric emptying rate)
  if (fat >= 8 && fat <= 24) {
    score -= 5;
  }

  // PCOS hormonal suitability score calibration
  if (pcosScore >= 8) {
    score -= 10;
  } else if (pcosScore <= 3) {
    score += 15;
  }

  // Clamp score cleanly between 10 and 92
  score = Math.max(10, Math.min(92, Math.round(score)));

  let riskLevel: FoodRiskLevel = 'Low';
  let riskTitle = 'Low Metabolic Risk — Optimal for PCOS';
  let riskTitleTe = 'తక్కువ ప్రమాదం — PCOS కి ఎంతో అనుకూలం';
  let riskExplanation = 'High in dietary fiber, protein, or low glycemic load. Protects ovarian theca cells from hyperinsulinemic surges and supports steady ovulatory cycles.';
  let riskExplanationTe = 'పుష్కలమైన పీచు (ఫైబర్) మరియు ప్రోటీన్ ఉన్నందున రక్తంలో చక్కెర వేగంగా పెరగకుండా ఇన్సులిన్ స్థాయిలను సమతుల్యంగా ఉంచుతుంది.';
  let glycemicSurgeRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  let insulinSpikeProbability: 'Low' | 'Moderate' | 'High' = 'Low';
  let metabolicBufferRating: 'High Buffer' | 'Moderate Buffer' | 'Low Buffer' = 'High Buffer';

  if (score <= 35) {
    riskLevel = 'Low';
    glycemicSurgeRisk = 'Low';
    insulinSpikeProbability = 'Low';
    metabolicBufferRating = 'High Buffer';
  } else if (score <= 65) {
    riskLevel = 'Moderate';
    riskTitle = 'Moderate Metabolic Risk — Balanced & Safe';
    riskTitleTe = 'మధ్యస్థ ప్రమాదం — సమతుల్యమైన మరియు సురక్షిత ఆహారం';
    riskExplanation = 'Standard wholesome meal with balanced complex carbohydrates. Safe and sustainable for PCOS when enjoyed in standard portions or alongside salad and curd.';
    riskExplanationTe = 'సాధారణ సమతుల్య ఆహారం. సలాడ్ లేదా పెరుగుతో కలిపి సరైన పరిమాణంలో తింటే రక్తంలో గ్లూకోజ్ అదుపులో ఉండి ఇన్సులిన్ సురక్షితంగా ఉంటుంది.';
    glycemicSurgeRisk = 'Moderate';
    insulinSpikeProbability = 'Moderate';
    metabolicBufferRating = 'Moderate Buffer';
  } else {
    riskLevel = 'Elevated';
    riskTitle = 'Elevated Glycemic Risk — Simple Pairing Recommended';
    riskTitleTe = 'ఎక్కువ గ్లైసిమిక్ ప్రమాదం — ఫైబర్/ప్రోటీన్ జత చేయడం మంచిది';
    riskExplanation = 'Contains rapid-absorbing carbohydrates with lower fiber. Pairing with a protein source, vegetable starter, or brisk walk will significantly buffer the insulin spike.';
    riskExplanationTe = 'రిఫైన్డ్ పిండిపదార్థాలు ఎక్కువ ఉండటం వల్ల ఇన్సులిన్ స్పైక్ వచ్చే అవకాశం ఉంది. సలాడ్ లేదా నట్స్ జత చేయడం వల్ల ఈ ప్రమాదాన్ని సులభంగా తగ్గించవచ్చు.';
    glycemicSurgeRisk = 'High';
    insulinSpikeProbability = 'High';
    metabolicBufferRating = 'Low Buffer';
  }

  const mitigatingFactors: string[] = [];
  if (fiber >= 5) mitigatingFactors.push(`${fiber}g fiber slows digestive carbohydrate breakdown`);
  if (protein >= 12) mitigatingFactors.push(`${protein}g protein promotes satiety and blunts glucose curve`);
  if (gl === 'Low') mitigatingFactors.push('Low Glycemic Load indicates portion-adjusted glucose stability');
  if (mitigatingFactors.length === 0) {
    mitigatingFactors.push('Can be shifted to Low Risk by adding raw cucumber/carrot slices before eating');
  }

  return {
    riskLevel,
    riskScore: score,
    riskTitle,
    riskTitleTe,
    riskExplanation,
    riskExplanationTe,
    glycemicSurgeRisk,
    insulinSpikeProbability,
    metabolicBufferRating,
    mitigatingFactors
  };
}

/**
 * Resizes and compresses an image data URL / file to prevent excessive payload sizes
 * while preserving high fidelity for Gemini vision model analysis.
 */
export async function optimizeImageForAnalysis(file: File | Blob, maxDimension: number = 1280, quality: number = 0.85): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            base64: e.target?.result as string,
            mimeType: file.type || 'image/jpeg'
          });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);
        resolve({ base64, mimeType });
      };
      img.onerror = () => reject(new Error('Failed to load image for optimization'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Send base64 image to server endpoint for Gemini 3.8 Flash multimodal analysis
 */
export async function analyzeFoodImageWithAI(params: {
  imageBase64: string;
  mimeType?: string;
  dietaryPreference?: string;
  language?: 'en' | 'te';
  dishHint?: string;
}): Promise<FoodScanResult> {
  const response = await fetch('/api/ai/scan-food', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64: params.imageBase64,
      mimeType: params.mimeType || 'image/jpeg',
      dietaryPreference: params.dietaryPreference || 'all',
      language: params.language || 'en',
      dishHint: params.dishHint || ''
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Food analysis request failed with status ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Invalid response from food scanner');
  }

  const rawData = result.data;
  let foodRisk = rawData.foodRisk;
  if (!foodRisk && rawData.isFood) {
    foodRisk = calculateFoodRiskEstimation(rawData);
  }

  // Ensure macronutrient percentages and summary are calibrated
  let estimatedNutrition = rawData.estimatedNutrition;
  if (estimatedNutrition && rawData.isFood) {
    const carbs = Number(estimatedNutrition.carbsG) || 0;
    const protein = Number(estimatedNutrition.proteinG) || 0;
    const fat = Number(estimatedNutrition.fatG) || 0;
    const fiber = Number(estimatedNutrition.fiberG) || 0;
    const netCarbs = Math.max(0, carbs - fiber);

    const carbCal = carbs * 4;
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const totalCal = carbCal + proteinCal + fatCal || 1;

    const macroPercentages = estimatedNutrition.macroPercentages || {
      protein: Math.round((proteinCal / totalCal) * 100),
      carbs: Math.round((carbCal / totalCal) * 100),
      fat: Math.max(0, 100 - (Math.round((proteinCal / totalCal) * 100) + Math.round((carbCal / totalCal) * 100)))
    };

    const macroBreakdownSummary = estimatedNutrition.macroBreakdownSummary ||
      (protein >= 15 && fiber >= 5
        ? `High metabolic buffer: ${protein}g protein paired with ${fiber}g fiber blunts carbohydrate absorption, providing sustained energy and stable insulin curves.`
        : `Balanced plate: ${carbs}g carbohydrates, ${protein}g protein, and ${fat}g healthy fats. Fiber (${fiber}g) helps modulate post-meal glucose.`);

    const macroBreakdownSummaryTe = estimatedNutrition.macroBreakdownSummaryTe ||
      `${protein} గ్రాముల ప్రోటీన్, ${carbs} గ్రాముల కార్బోహైడ్రేట్లు, ${fiber} గ్రాముల ఫైబర్ మరియు ${fat} గ్రాముల ఆరోగ్యకరమైన కొవ్వులు PCOS హార్మోన్ల సమతుల్యతకు తోడ్పడతాయి.`;

    estimatedNutrition = {
      ...estimatedNutrition,
      netCarbsG: netCarbs,
      macroPercentages,
      macroBreakdownSummary,
      macroBreakdownSummaryTe
    };
  }

  const scanResult: FoodScanResult = {
    ...rawData,
    foodRisk,
    estimatedNutrition,
    imagePreviewUrl: params.imageBase64
  };

  // Automatically record to local history if it was successfully analyzed
  saveScanToHistory(scanResult);

  return scanResult;
}

/**
 * Save scan result to local history
 */
export function saveScanToHistory(scan: FoodScanResult): void {
  try {
    const existing = getScanHistory();
    // Prepend new scan, filter out duplicates by id
    const updated = [scan, ...existing.filter(s => s.id !== scan.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist scan history:', err);
  }
}

/**
 * Retrieve local scan history
 */
export function getScanHistory(): FoodScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: FoodScanResult[] = JSON.parse(raw);
    // Ensure all historical food scans have calibrated risk estimation
    return parsed.map(item => {
      if (item.isFood && !item.foodRisk) {
        return {
          ...item,
          foodRisk: calculateFoodRiskEstimation(item)
        };
      }
      return item;
    });
  } catch (err) {
    console.warn('Failed to parse scan history:', err);
    return [];
  }
}

/**
 * Delete a scan from history
 */
export function deleteScanFromHistory(id: string): void {
  try {
    const existing = getScanHistory();
    const updated = existing.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete scan:', err);
  }
}

/**
 * Clear all scan history
 */
export function clearAllScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear scan history:', err);
  }
}

/**
 * Curated Sample Dishes and Non-Food Test Cases
 * Allows instant testing for users without camera or prepared dish photos
 */
export interface FoodSamplePreset {
  id: string;
  name: string;
  category: 'optimal' | 'moderate' | 'high_gi' | 'non_food';
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'N/A';
  description: string;
  hint: string;
  thumbnailEmoji: string;
  giRating: 'Low' | 'Medium' | 'High' | 'N/A';
  isFood: boolean;
  sampleImageDataUrl: string;
}

// Generate simple SVG data URLs for sample dishes to enable immediate testing
function createSvgDataUrl(bg: string, emoji: string, title: string, subtitle: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" rx="24" fill="${bg}"/>
    <circle cx="300" cy="170" r="90" fill="white" fill-opacity="0.15"/>
    <text x="300" y="195" font-size="80" text-anchor="middle">${emoji}</text>
    <text x="300" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
    <text x="300" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="white" fill-opacity="0.85" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_FOOD_PRESETS: FoodSamplePreset[] = [
  {
    id: 'sample_palak_paneer',
    name: 'Palak Paneer with Brown Rice & Cucumber Salad',
    category: 'optimal',
    riskLevel: 'Low',
    description: 'High in spinach antioxidants, paneer protein, and fiber. Low glycemic load and very low insulin surge risk.',
    hint: 'Palak Paneer with 1 small bowl brown rice and sliced cucumber salad',
    thumbnailEmoji: '🥗',
    giRating: 'Low',
    isFood: true,
    sampleImageDataUrl: createSvgDataUrl('#0f766e', '🥗', 'Palak Paneer & Brown Rice', 'Low Risk: High Fiber & Protein')
  },
  {
    id: 'sample_moong_dal_khichdi',
    name: 'Methi Moong Dal Khichdi with Probiotic Curd',
    category: 'optimal',
    riskLevel: 'Low',
    description: 'Fenugreek enhances insulin sensitivity, split yellow moong provides gentle protein, and curd delivers probiotics.',
    hint: 'Methi Moong Dal Khichdi with probiotic curd and steamed greens',
    thumbnailEmoji: '🍲',
    giRating: 'Low',
    isFood: true,
    sampleImageDataUrl: createSvgDataUrl('#047857', '🍲', 'Methi Moong Khichdi & Curd', 'Low Risk: Insulin-Sensitizing & Gentle')
  },
  {
    id: 'sample_roti_dal_sabzi',
    name: '2 Phulka Rotis with Tadka Dal & Bhindi Sabzi',
    category: 'optimal',
    riskLevel: 'Low',
    description: 'Standard everyday Indian staple. High in okra (bhindi) soluble fiber and lentil protein, giving a stable glycemic curve.',
    hint: '2 whole wheat phulkas with yellow dal tadka and bhindi fry sabzi with cucumber',
    thumbnailEmoji: '🫓',
    giRating: 'Low',
    isFood: true,
    sampleImageDataUrl: createSvgDataUrl('#15803d', '🫓', 'Phulka Rotis & Dal Sabzi', 'Low Risk: Wholesome Everyday Meal')
  },
  {
    id: 'sample_masala_dosa',
    name: 'Masala Dosa with Mixed Vegetable Sambar & Chutney',
    category: 'moderate',
    riskLevel: 'Moderate',
    description: 'Fermented crepe with spiced potato filling. Moderate risk; vegetable sambar protein and fiber buffer the rice batter.',
    hint: 'Masala Dosa with spiced potato masala, coconut chutney, and mixed vegetable sambar',
    thumbnailEmoji: '🥞',
    giRating: 'Medium',
    isFood: true,
    sampleImageDataUrl: createSvgDataUrl('#b45309', '🥞', 'Masala Dosa with Sambar', 'Moderate Risk: Balanced Traditional Breakfast')
  },
  {
    id: 'sample_white_bread_jam',
    name: 'Refined White Toast with Sweet Fruit Jam',
    category: 'high_gi',
    riskLevel: 'Elevated',
    description: 'High refined simple sugars without fiber or protein buffer. Triggers rapid glucose surge and reactive insulin release.',
    hint: 'Two slices of refined white bread toast with commercial strawberry jam',
    thumbnailEmoji: '🍞',
    giRating: 'High',
    isFood: true,
    sampleImageDataUrl: createSvgDataUrl('#be123c', '🍞', 'White Toast & Sweet Jam', 'Elevated Risk: Refined Fast-Carbs')
  },
  {
    id: 'sample_laptop_desk',
    name: 'Test Non-Food Image: Laptop & Office Desk',
    category: 'non_food',
    riskLevel: 'N/A',
    description: 'A test photo showing a computer keyboard, mouse, and office desk. Used to verify the AI detects non-food photos.',
    hint: 'Office desk with laptop computer and coffee mug',
    thumbnailEmoji: '💻',
    giRating: 'N/A',
    isFood: false,
    sampleImageDataUrl: createSvgDataUrl('#334155', '💻', 'Laptop & Office Desk', 'Non-Food Image Test Case')
  }
];
