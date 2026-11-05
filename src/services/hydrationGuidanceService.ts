/**
 * PCOSense - Medical Nutrition Hydration Guidance Service
 * Clinically grounded in insulin regulation, gastric enzyme preservation,
 * and endocrine balance for PCOS.
 */

import { MealCategory, RecipeItem } from '../types';

export interface MealHydrationInfo {
  amountMl: number;
  displayAmount: string;
  timing: string;
  timingTe: string;
  temperature: 'warm' | 'room' | 'herbal';
  temperatureLabel: string;
  temperatureLabelTe: string;
  rationale: string;
  rationaleTe: string;
  recommendedInfusion: string;
  recommendedInfusionTe: string;
}

export const DAILY_PCOS_HYDRATION_TARGET_ML = 2600; // 2.6 Liters

export const MEAL_HYDRATION_GUIDANCE: Record<MealCategory, MealHydrationInfo> = {
  breakfast: {
    amountMl: 350,
    displayAmount: '350 ml',
    timing: 'Drink 20–30 min before breakfast',
    timingTe: 'అల్పాహారానికి 20–30 నిమిషాల ముందు త్రాగండి',
    temperature: 'warm',
    temperatureLabel: 'Warm / Lukewarm',
    temperatureLabelTe: 'గోరువెచ్చని నీరు',
    rationale: 'Rehydrates tissues after nocturnal fasting, stimulates gastrocolic motility, and prepares digestive enzymes without diluting hydrochloric acid.',
    rationaleTe: 'రాత్రి ఉపవాసం తర్వాత కణజాలాలను రీహైడ్రేట్ చేస్తుంది మరియు జీర్ణ ఎంజైమ్‌లను ఉత్తేజపరుస్తుంది.',
    recommendedInfusion: 'Lukewarm water with lemon slice or roasted cumin (jeera) water.',
    recommendedInfusionTe: 'నిమ్మరసం లేదా జీలకర్ర కలిపిన గోరువెచ్చని నీరు.'
  },
  mid_morning: {
    amountMl: 300,
    displayAmount: '300 ml',
    timing: 'Drink between 10:30 AM – 11:30 AM',
    timingTe: 'ఉదయం 10:30 – 11:30 మధ్య త్రాగండి',
    temperature: 'herbal',
    temperatureLabel: 'Herbal Infusion / Room Temp',
    temperatureLabelTe: 'మూలికా కషాయం / గది ఉష్ణోగ్రత',
    rationale: 'Flushes metabolic byproducts from early morning hormone clearance. Spearmint specifically inhibits 5α-reductase, lowering free testosterone.',
    rationaleTe: 'శరీరం నుండి వ్యర్థాలను తొలగిస్తుంది. పుదీనా టీ ఆండ్రోజెన్ మరియు టెస్తోస్టెరాన్ స్థాయిలను తగ్గిస్తుంది.',
    recommendedInfusion: 'Organic spearmint tea or cucumber-mint mineral infusion.',
    recommendedInfusionTe: 'పుదీనా టీ లేదా దోసకాయ-పుదీనా కలిపిన నీరు.'
  },
  lunch: {
    amountMl: 400,
    displayAmount: '400 ml',
    timing: 'Drink 25–30 min before lunch (small sips 45m post-meal)',
    timingTe: 'భోజనానికి 25–30 నిమిషాల ముందు (భోజనం తర్వాత 45 నిమిషాలకు చిన్న గుటకలు)',
    temperature: 'room',
    temperatureLabel: 'Room Temperature',
    temperatureLabelTe: 'గది ఉష్ణోగ్రత నీరు',
    rationale: 'Pre-meal volume triggers stomach mechanoreceptors to signal satiety, blunting postprandial glucose surges by up to 22%. Avoid ice-cold drinks.',
    rationaleTe: 'భోజనానికి ముందు నీరు త్రాగడం వల్ల ఆకలి అదుపులో ఉండి, భోజనం తర్వాత రక్తంలో గ్లూకోజ్ పెరగకుండా నియంత్రిస్తుంది.',
    recommendedInfusion: 'Pure filtered water or light buttermilk with curry leaves.',
    recommendedInfusionTe: 'శుద్ధి చేసిన స్వచ్ఛమైన నీరు లేదా కరివేపాకు మజ్జిగ.'
  },
  evening_snack: {
    amountMl: 300,
    displayAmount: '300 ml',
    timing: 'Drink between 4:00 PM – 5:00 PM',
    timingTe: 'సాయంత్రం 4:00 – 5:00 మధ్య త్రాగండి',
    temperature: 'herbal',
    temperatureLabel: 'Warm Herbal Tea',
    temperatureLabelTe: 'గోరువెచ్చని హెర్బల్ టీ',
    rationale: 'Stabilizes late-afternoon cortisol dip, preventing emotional sugar and carbohydrate binging before dinner.',
    rationaleTe: 'సాయంత్రం కార్టిసాల్ ఒత్తిడిని సమతుల్యం చేసి, తీపి లేదా జంక్ ఫుడ్ తినాలనే కోరికలను అడ్డుకుంటుంది.',
    recommendedInfusion: 'Ceylon cinnamon infusion or decaffeinated green tea.',
    recommendedInfusionTe: 'దాల్చినచెక్క టీ లేదా గ్రీన్ టీ.'
  },
  dinner: {
    amountMl: 350,
    displayAmount: '350 ml',
    timing: 'Drink 30 min before dinner',
    timingTe: 'రాత్రి భోజనానికి 30 నిమిషాల ముందు త్రాగండి',
    temperature: 'warm',
    temperatureLabel: 'Lukewarm',
    temperatureLabelTe: 'గోరువెచ్చని నీరు',
    rationale: 'Aids in lubricating high-fiber grains and legumes, ensuring gentle overnight peristalsis without gastric reflux.',
    rationaleTe: 'పీచు పదార్థాలు సులభంగా జీర్ణమవడానికి మరియు రాత్రిపూట అజీర్తి లేకుండా ఉండటానికి సహాయపడుతుంది.',
    recommendedInfusion: 'Warm water with a pinch of black pepper and ginger.',
    recommendedInfusionTe: 'మిరియాలు లేదా అల్లం కలిపిన గోరువెచ్చని నీరు.'
  },
  bedtime_drink: {
    amountMl: 250,
    displayAmount: '250 ml',
    timing: 'Drink 45 min before bedtime',
    timingTe: 'నిద్రపోవడానికి 45 నిమిషాల ముందు త్రాగండి',
    temperature: 'warm',
    temperatureLabel: 'Warm Elixir',
    temperatureLabelTe: 'గోరువెచ్చని పానీయం',
    rationale: 'Prevents midnight cellular dehydration while promoting nocturnal melatonin release and deep slow-wave restorative sleep.',
    rationaleTe: 'గాఢ నిద్రకు మరియు హార్మోన్ల మరమ్మతుకు సహాయపడుతుంది; రాత్రిపూట నీరసం రాకుండా చూస్తుంది.',
    recommendedInfusion: 'Chamomile tea, warm golden turmeric almond milk, or nutmeg water.',
    recommendedInfusionTe: 'చామంతి టీ లేదా పసుపు కలిపిన గోరువెచ్చని బాదం పాలు.'
  }
};

export function getMealHydrationGuidance(
  mealCategory: MealCategory,
  recipe?: RecipeItem
): MealHydrationInfo {
  const base = MEAL_HYDRATION_GUIDANCE[mealCategory] || MEAL_HYDRATION_GUIDANCE.lunch;
  
  // If recipe has high fiber (>8g), gently increase hydration guidance by 50ml
  if (recipe && recipe.fiberGrams >= 8 && mealCategory !== 'bedtime_drink') {
    return {
      ...base,
      amountMl: base.amountMl + 50,
      displayAmount: `${base.amountMl + 50} ml`,
      rationale: `${base.rationale} (Extra 50 ml recommended due to high ${recipe.fiberGrams}g prebiotic fiber content).`,
      rationaleTe: `${base.rationaleTe} (అధిక పీచు ${recipe.fiberGrams} గ్రాములు ఉన్నందున అదనపు 50 మి.లీ నీరు సిఫార్సు చేయబడింది).`
    };
  }

  return base;
}
