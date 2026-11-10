// Pure nutrition calculations. Photo-derived amounts are estimates and may require correction.
const nutrients = { kcal: 'kcal', p: 'protein', c: 'carbs', f: 'fat' };

function validAmount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function mealTotals(entry) {
  const multiplier = validAmount(entry?.m) || 1;
  const totals = { kcal: 0, p: 0, c: 0, f: 0 };
  if (!Array.isArray(entry?.items)) return totals;
  for (const item of entry.items) {
    for (const [target, field] of Object.entries(nutrients)) {
      totals[target] += validAmount(item?.[field]) * multiplier;
    }
  }
  return totals;
}

// Preserve the estimate's nutrient density when a user corrects the amount in grams.
// Values should still be checked against measured weights or a food database.
export function rescaleFoodItem(item, grams) {
  const previous = Number(item?.grams);
  const next = Number(grams);
  if (!Number.isFinite(previous) || previous <= 0 ||
      !Number.isFinite(next) || next < 1 || next > 3000) return null;
  const ratio = next / previous;
  const scale = value => Math.round(validAmount(value) * ratio * 10) / 10;
  return {
    ...item,
    grams: Math.round(next * 10) / 10,
    kcal: scale(item.kcal),
    protein: scale(item.protein),
    carbs: scale(item.carbs),
    fat: scale(item.fat)
  };
}


// Explicit user corrections take precedence over a vision model's estimates.
// Reject invalid values rather than allowing NaN, negative or unbounded entries into storage.
export function correctFoodItem(item, fields) {
  if (!item || typeof item !== 'object' || !fields || typeof fields !== 'object') return null;
  const name = String(fields.name ?? item.name ?? '').trim().slice(0, 60);
  if (!name) return null;
  const numbers = {};
  for (const [field, limit] of Object.entries({
    grams: 3000, kcal: 10000, protein: 2500, carbs: 2500, fat: 2500
  })) {
    const raw = fields[field] ?? item[field] ?? 0;
    if (typeof raw === 'string' && raw.trim() === '') return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > limit) return null;
    numbers[field] = Math.round(value * 10) / 10;
  }
  return { ...item, name, ...numbers };
}

// Review prompt only: labels unexplained differences, never silently rewrites calories.
// Fibre, alcohol, labelling conventions and estimation errors can explain discrepancies.
export function calorieConsistency(entry) {
  const t = mealTotals(entry);
  if (t.kcal <= 0) return { needsReview: false, calculatedKcal: 0 };
  const calculatedKcal = Math.round(4 * t.p + 4 * t.c + 9 * t.f);
  return { needsReview: Math.abs(calculatedKcal - t.kcal) / t.kcal > 0.25, calculatedKcal };
}
