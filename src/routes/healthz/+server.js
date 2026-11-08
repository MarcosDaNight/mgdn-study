import { db } from '$lib/server/db.js';
import { allItems } from '$lib/server/content.js';

export function GET() {
  db.prepare('SELECT 1').get();
  return new Response(`ok ${allItems().length}\n`);
}
