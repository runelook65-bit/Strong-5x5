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
