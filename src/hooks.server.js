export function handle({ event, resolve }) {
  const c = event.cookies.get('lang');
  event.locals.lang = c === 'en' ? 'en' : 'pt';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang === 'en' ? 'en' : 'pt-BR')
  });
}
