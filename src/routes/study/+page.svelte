<script>
  import { t, L, fmt } from '$lib/i18n.js';
  import { onMount } from 'svelte';

  let { data } = $props();
  const s = $derived(t(data.lang));

  let queue = $state([...data.queue]);
  const total = data.queue.length;
  let answered = $state(0);
  let phase = $state('ask'); // ask | feedback
  let revealed = $state(false); // card
  let picked = $state(null); // choice
  let built = $state([]); // command: índices do banco de peças
  let ok = $state(null);
  let xp = $state(0);
  let right = $state(0);
  let graded = $state(0);

  const cur = $derived(queue[0]);
  const done = $derived(!cur);
  const builtTokens = $derived(cur?.type === 'command' ? built.map((i) => cur.bank[i]) : []);

  async function submit(grade) {
    const item = cur;
    ok = grade > 1;
    graded++;
    if (ok) right++;
    try {
      const r = await (await fetch('/api/answer', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, grade }) })).json();
      xp += r.xp ?? 0;
    } catch {
      /* offline: a resposta não conta; segue a sessão */
    }
    // Errou: volta ao fim da fila nesta sessão (recuperação ativa até acertar).
    if (grade === 1) queue = [...queue.slice(1), { ...item, isNew: false, retry: true }];
    else queue = queue.slice(1);
    // O feedback mostra o item que acabou de ser respondido.
    last = item;
    phase = 'feedback';
    answered = total - Math.min(total, queue.filter((q) => !q.retry).length);
  }
  let last = $state(null);

  function next() {
    phase = 'ask';
    revealed = false;
    picked = null;
    built = [];
    ok = null;
    last = null;
  }

  const pickOption = (i) => {
    if (phase !== 'ask') return;
    picked = i;
    submit(i === cur.correct ? 3 : 1);
  };
  const addToken = (i) => {
    if (phase === 'ask' && !built.includes(i)) built = [...built, i];
  };
  const undo = () => (built = built.slice(0, -1));
  const check = () => {
    if (!built.length) return;
    submit(builtTokens.join(' ') === cur.answer.join(' ') ? 3 : 1);
  };

  onMount(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || done) return;
      const k = e.key;
      if (phase === 'feedback' && (k === 'Enter' || k === ' ' || k === 'ArrowRight')) {
        e.preventDefault();
        return next();
      }
      if (phase !== 'ask') return;
      if (cur.type === 'card') {
        if (!revealed && (k === 'Enter' || k === ' ')) { e.preventDefault(); revealed = true; }
        else if (revealed && '1234'.includes(k) && k) submit(Number(k));
      } else if (cur.type === 'choice' && '123456'.includes(k) && k) {
        const i = Number(k) - 1;
        if (i < cur.options.pt.length) pickOption(i);
      } else if (cur.type === 'command') {
        if (k === 'Enter') { e.preventDefault(); check(); }
        else if (k === 'Backspace') undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const accuracy = $derived(graded ? Math.round((right / graded) * 100) : 0);
  const progress = $derived(total ? Math.round((answered / total) * 100) : 100);
</script>

<svelte:head><title>{s.app} · {s.study}</title></svelte:head>

{#if total === 0}
  <section class="center card-surface">
    <div class="big-emoji">🌙</div>
    <h1>{s.nothing}</h1>
    <p class="muted">{s.nothingSub}</p>
    <a class="btn primary" href="/">{s.home}</a>
  </section>
{:else if done && phase === 'ask'}
  <section class="center card-surface">
    <div class="big-emoji">🎉</div>
    <h1>{s.doneTitle}</h1>
    <p class="muted">{s.doneSub}</p>
    <div class="chips">
      <span class="chip"><b>+{xp}</b> {s.xp}</span>
      <span class="chip"><b>{accuracy}%</b> {s.accuracy}</span>
      <span class="chip">🔥 <b>{data.streak.streak}</b></span>
    </div>
    <a class="btn primary big" href="/">{s.home}</a>
  </section>
{:else}
  <div class="session">
    <header class="sess-top">
      <a class="x" href="/" aria-label={s.home}>✕</a>
      <div class="bar"><i style="width:{progress}%"></i></div>
      <span class="muted tiny">{xp} {s.xp}</span>
    </header>

    {#key phase === 'feedback' ? `f-${last?.id}` : cur?.id}
      {@const it = phase === 'feedback' ? last : cur}
      <article class="q card-surface">
        <div class="tags">
          <span class="tag" class:new={it.isNew}>{it.isNew ? s.newItem : s.review}</span>
          <span class="tag ghost">{it.unit.replace(/^[a-z]+-/, '')}</span>
        </div>
        {#if it.isNew && phase === 'ask'}<p class="hint tiny">{s.learnFirst}</p>{/if}
        <h1 class="prompt">{@html fmt(L(it.q, data.lang))}</h1>

        {#if it.type === 'card'}
          {#if revealed || phase === 'feedback'}
            <div class="answer">{@html fmt(L(it.a, data.lang))}</div>
          {/if}
        {:else if it.type === 'choice'}
          <ul class="opts">
            {#each it.order as oi, pos}
              {@const sel = picked === pos}
              {@const isRight = pos === it.correct}
              <li>
                <button
                  class="opt"
                  class:good={phase === 'feedback' && isRight}
                  class:bad={phase === 'feedback' && sel && !isRight}
                  disabled={phase === 'feedback'}
                  onclick={() => pickOption(pos)}
                >
                  <kbd>{pos + 1}</kbd>
                  <span>{@html fmt(it.options[data.lang][oi])}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="muted tiny">{s.tapTokens}</p>
          <div class="slot" class:good={phase === 'feedback' && ok} class:bad={phase === 'feedback' && !ok} aria-live="polite">
            <span class="ps">$</span>
            {#each (phase === 'feedback' ? (ok ? it.answer : builtTokens) : builtTokens) as tk}<code class="tok placed">{tk}</code>{/each}
            {#if !builtTokens.length && phase === 'ask'}<span class="caret"></span>{/if}
          </div>
          {#if phase === 'ask'}
            <div class="bank">
              {#each it.bank as tk, i}
                <button class="tok" disabled={built.includes(i)} onclick={() => addToken(i)}>{tk}</button>
              {/each}
            </div>
          {:else if !ok}
            <p class="muted tiny">{s.expected}:</p>
            <div class="slot good"><span class="ps">$</span>{#each it.answer as tk}<code class="tok placed">{tk}</code>{/each}</div>
          {/if}
        {/if}

        {#if phase === 'feedback'}
          <div class="fb" class:good={ok} class:bad={!ok} role="status">
            <strong>{ok ? s.correct : s.wrong}</strong>
            {#if it.why}<p>{@html fmt(L(it.why, data.lang))}</p>{/if}
            <a class="src" href={it.src} target="_blank" rel="noopener noreferrer">{s.source} ↗</a>
          </div>
        {/if}
      </article>
    {/key}

    <footer class="actions">
      {#if phase === 'feedback'}
        <button class="btn primary big" onclick={next}>{s.next}</button>
      {:else if cur.type === 'card'}
        {#if !revealed}
          <button class="btn primary big" onclick={() => (revealed = true)}>{s.reveal}</button>
        {:else}
          <div class="grades">
            <button class="g g1" onclick={() => submit(1)}><kbd>1</kbd>{s.again}</button>
            <button class="g g2" onclick={() => submit(2)}><kbd>2</kbd>{s.hard}</button>
            <button class="g g3" onclick={() => submit(3)}><kbd>3</kbd>{s.good}</button>
            <button class="g g4" onclick={() => submit(4)}><kbd>4</kbd>{s.easy}</button>
          </div>
        {/if}
      {:else if cur.type === 'command'}
        <div class="cmd-actions">
          <button class="btn" onclick={undo} disabled={!built.length}>⌫ {s.clear}</button>
          <button class="btn primary" onclick={check} disabled={!built.length}>{s.check}</button>
        </div>
      {/if}
      <p class="keys tiny muted">{s.keys}</p>
    </footer>
  </div>
{/if}
