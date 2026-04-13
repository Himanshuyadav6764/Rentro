export type ItemCondition = 'new' | 'used';
export type DemandLevel = 'high' | 'medium' | 'low';

export type AiSuggestion = {
  suggested_price: number;
  confidence: 'high' | 'medium' | 'low';
  speed_boost: string;
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
