import { json, error } from '@sveltejs/kit';
import { answer } from '$lib/server/session.js';
import { streakInfo } from '$lib/server/streak.js';

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'JSON inválido');
  }
  try {
    const r = answer(String(body.id), Number(body.grade), { hinted: body.hinted === true, retry: body.retry === true });
    return json({ ...r, streak: streakInfo() });
  } catch {
    throw error(400, 'resposta inválida');
  }
}
