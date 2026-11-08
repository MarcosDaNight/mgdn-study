import { GOALS, NEW_LIMITS, dailyGoal, newPerDay, saveSettings } from '$lib/server/settings.js';
import { allItems } from '$lib/server/content.js';

export function load() {
  return { goal: dailyGoal(), newPerDay: newPerDay(), goals: GOALS, newLimits: NEW_LIMITS, items: allItems().length };
}

export const actions = {
  default: async ({ request }) => {
    const f = await request.formData();
    saveSettings({ goal: Number(f.get('goal')), newPerDay: Number(f.get('newPerDay')) });
    return { saved: true };
  }
};
