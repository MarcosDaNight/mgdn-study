<script>
  import '../app.css';
  import { page } from '$app/state';
  import { invalidateAll } from '$app/navigation';
  import { t } from '$lib/i18n.js';
  import { onMount } from 'svelte';

  let { data, children } = $props();
  const s = $derived(t(data.lang));
  // Na sessão de estudo a navegação some (modo foco): só o ✕ e a barra de progresso.
  const focus = $derived(page.url.pathname.startsWith('/study'));
  const at = (p) => (p === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(p));

  async function setLang(lang) {
    await fetch('/api/lang', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang }) });
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    await invalidateAll();
  }

  onMount(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
</script>

<div class="shell" class:focus>
  {#if !focus}
    <nav class="nav" aria-label="principal">
      <a class="brand" href="/"><span class="logo">⎈</span><span>{s.app}</span></a>
      <a href="/" aria-current={at('/') ? 'page' : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span>{s.home}</span></a>
      <a href="/study" aria-current={at('/study') ? 'page' : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg><span>{s.study}</span></a>
      <a href="/settings" aria-current={at('/settings') ? 'page' : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/></svg><span>{s.settings}</span></a>
      <div class="lang" role="group" aria-label={s.language}>
        <button class:on={data.lang === 'pt'} onclick={() => setLang('pt')} aria-pressed={data.lang === 'pt'}>PT</button>
        <button class:on={data.lang === 'en'} onclick={() => setLang('en')} aria-pressed={data.lang === 'en'}>EN</button>
      </div>
    </nav>
  {/if}
  <main class="main">{@render children()}</main>
</div>
