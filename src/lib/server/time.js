// "Dia" de estudo no fuso do usuário (e não em UTC), para o streak virar à meia-noite local.
const TZ = process.env.TZ || 'America/Sao_Paulo';
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });

export const dayOf = (ms = Date.now()) => fmt.format(ms); // YYYY-MM-DD

export function addDays(day, n) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
