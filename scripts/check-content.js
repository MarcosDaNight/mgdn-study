// `npm run check:content`: falha se algum item do currículo estiver incompleto.
import { getTracks, allItems } from '../src/lib/server/content.js';

const tracks = getTracks();
for (const t of tracks) {
  const n = t.units.reduce((s, u) => s + u.items.length, 0);
  console.log(`${t.track.padEnd(8)} ${String(n).padStart(3)} itens em ${t.units.length} unidades`);
}
console.log(`ok: ${allItems().length} itens`);
