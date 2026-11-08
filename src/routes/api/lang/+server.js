import { json } from '@sveltejs/kit';

export function POST({ request, cookies }) {
  return request.json().then(({ lang }) => {
    const v = lang === 'en' ? 'en' : 'pt';
    cookies.set('lang', v, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', httpOnly: false });
    return json({ lang: v });
  });
}
