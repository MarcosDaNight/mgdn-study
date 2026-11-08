import { json, error } from '@sveltejs/kit';
import { answer } from '$lib/server/session.js';
import { streakInfo } from '$lib/server/streak.js';

export async function POST({ request }) {
  const { id, grade } = await request.json();
  try {
    const r = answer(String(id), Number(grade));
    return json({ ...r, streak: streakInfo() });
  } catch {
    throw error(400, 'resposta inválida');
  }
}
