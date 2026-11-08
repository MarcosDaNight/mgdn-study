// `npm run check:content`: falha se algum item do currículo estiver incompleto.
import { loadTracks } from '../src/lib/server/content.js';
const t = loadTracks();
const n = t.reduce((s, x) => s + x.units.reduce((a, u) => a + u.items.length, 0), 0);
console.log(`ok: ${t.length} trilhas, ${n} itens`);
