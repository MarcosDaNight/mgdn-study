<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { t } from '$lib/i18n.js';
  import { onMount } from 'svelte';

  let { data, children } = $props();
  const s = $derived(t(data.lang));

  async function setLang(lang) {
    await fetch('/api/lang', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang }) });
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    await invalidateAll();
  }

  onMount(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
</script>

<div class="shell">
  <nav class="nav" aria-label="principal">
    <a class="brand" href="/"><span class="logo">⎈</span><span class="brand-t">{s.app}</span></a>
    <a href="/" class:active={$page.url.pathname === '/'}><span class="ico">⌂</span><span>{s.home}</span></a>
    <a href="/study" class:active={$page.url.pathname.startsWith('/study')}><span class="ico">▶</span><span>{s.study}</span></a>
    <div class="lang" role="group" aria-label={s.language}>
      <button class:on={data.lang === 'pt'} onclick={() => setLang('pt')}>PT</button>
      <button class:on={data.lang === 'en'} onclick={() => setLang('en')}>EN</button>
    </div>
  </nav>
  <main class="main">{@render children()}</main>
</div>
