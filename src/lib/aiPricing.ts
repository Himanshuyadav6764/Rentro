export type ItemCondition = 'new' | 'used';
export type DemandLevel = 'high' | 'medium' | 'low';

export type AiSuggestion = {
  suggested_price: number;
  confidence: 'high' | 'medium' | 'low';
  speed_boost: string;
};

export type SmartPricePreview = {
  min: number;
  max: number;
  confidence: 'high' | 'medium' | 'low';
  note: string;
};

export function getAISuggestedPrice(
  _category: string,
  condition: ItemCondition,
  demand: DemandLevel
): AiSuggestion {
  const base_price = 50;

  const condition_factor = condition === 'new' ? 1.2 : 0.8;
  const demand_factor = demand === 'high' ? 1.5 : demand === 'medium' ? 1 : 0.7;

  const price = base_price * condition_factor * demand_factor;

  return {
    suggested_price: Math.round(price),
    confidence: demand === 'high' ? 'high' : demand === 'medium' ? 'medium' : 'low',
    speed_boost: demand === 'high' ? '40%' : '20%',
  };
}

const KEYWORD_BASE_PRICE: Array<{ pattern: RegExp; base: number; confidence: 'high' | 'medium' | 'low' }> = [
  { pattern: /(iphone|smartphone|mobile|oneplus|samsung|phone)/, base: 30, confidence: 'high' },
  { pattern: /(laptop|macbook|notebook|computer)/, base: 55, confidence: 'high' },
  { pattern: /(watch|smart ?watch)/, base: 20, confidence: 'medium' },
  { pattern: /(headphone|earphone|speaker|airpods|buds)/, base: 18, confidence: 'medium' },
  { pattern: /(charger|adapter|cable|power bank)/, base: 10, confidence: 'high' },
  { pattern: /(calculator|scientific calculator)/, base: 10, confidence: 'high' },
  { pattern: /(book|notes|novel|guide)/, base: 8, confidence: 'high' },
  { pattern: /(cycle|bicycle|helmet)/, base: 22, confidence: 'medium' },
  { pattern: /(chair|table|desk|lamp|bed)/, base: 16, confidence: 'medium' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function baseByCategory(category: string) {
  const c = category.toLowerCase();
  if (/(laptop|mobiles|electronics|accessories|audio)/.test(c)) return 22;
  if (/(books|notes|stationery|academic)/.test(c)) return 9;
  if (/(table|chair|bed|storage|lamps|furniture)/.test(c)) return 16;
  if (/(cycle|scooter|travel|safety|transport)/.test(c)) return 20;
  return 12;
}

export function getSmartPricePreview(
  title: string,
  category: string,
  imageLabel?: string
): SmartPricePreview {
  const text = `${title} ${imageLabel || ''}`.toLowerCase();
  const categoryBase = baseByCategory(category || 'others');

  let pickedBase = categoryBase;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  for (const entry of KEYWORD_BASE_PRICE) {
    if (entry.pattern.test(text)) {
      pickedBase = entry.base;
      confidence = entry.confidence;
      break;
    }
  }

  if (confidence === 'low' && categoryBase > 12) {
    confidence = 'medium';
  }

  const spread = confidence === 'high' ? 3 : confidence === 'medium' ? 5 : 7;
  const min = clamp(Math.round(pickedBase - spread), 5, 500);
  const max = clamp(Math.round(pickedBase + spread), min + 2, 600);

  return {
    min,
    max,
    confidence,
    note: `Similar items rent at Rs ${min}-${max}/day`,
  };
}
