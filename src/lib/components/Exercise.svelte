<script>
  import { t, L, fmt, fmtInterval, pick } from '$lib/i18n.js';
  import ChoiceBody from './ChoiceBody.svelte';
  import Builder from './Builder.svelte';

  // Um exercício, do enunciado ao feedback. O estado é local e some com a chave (`item.uid`).
  // Avisa o pai uma vez por resposta (onanswer) e quando o aluno segue (onnext).
  let { item, lang, onanswer, onnext } = $props();
  const s = $derived(t(lang));

  let phase = $state('ask'); // ask | feedback
  let ok = $state(null);
  let hinted = $state(false);
  let revealed = $state(false); // card
  let picked = $state(null); // choice
  let hidden = $state(new Set()); // choice: opções eliminadas pela dica
  let built = $state([]); // command/order: índices do banco, na ordem escolhida
  let title = $state('');

  // Banco de peças (command) ou de passos (order), no formato do Builder.
  const bank = $derived(
    item.type === 'command'
      ? item.bank.map((label) => ({ label }))
      : item.type === 'order'
        ? item.order.map((i) => ({ label: item.steps[lang][i], i }))
        : []
  );
  const expected = $derived(item.type === 'command' ? item.answer : item.type === 'order' ? item.steps[lang] : []);

  const canHint = $derived(phase === 'ask' && !hinted && ['choice', 'command', 'order'].includes(item.type));
  const hintText = $derived.by(() => {
    if (!hinted) return '';
    if (item.hint) return L(item.hint, lang);
    if (item.type === 'command') return s.hintCmd(item.answer[0], item.answer.length);
    if (item.type === 'order') return s.hintOrder(item.steps[lang][0]);
    return s.hintChoice;
  });

  function useHint() {
    if (!canHint) return;
    hinted = true;
    if (item.type === 'choice') {
      const wrong = item.order.map((_, p) => p).filter((p) => p !== item.correct);
      // Sobra sempre a certa e ao menos uma errada: com 3+ erradas tira 2; com 2 tira 1.
      const n = wrong.length >= 3 ? 2 : wrong.length - 1;
      hidden = new Set(wrong.sort(() => Math.random() - 0.5).slice(0, n));
    }
  }

  function finish(grade) {
    if (phase !== 'ask') return; // duplo toque
    ok = grade > 1;
    title = pick(ok ? s.correctT : s.wrongT);
    phase = 'feedback';
    onanswer({ grade, hinted });
    if (item.type === 'card') onnext(); // cartão: a nota já é o feedback, segue direto
  }

  const norm = (a) => a.join('\u0001');
  const answers = $derived(item.type === 'command' ? [item.answer, ...(item.alts ?? [])].map(norm) : []);

  function check() {
    if (phase !== 'ask' || !built.length) return;
    if (item.type === 'command') finish(answers.includes(norm(built.map((i) => bank[i].label))) ? 3 : 1);
    else finish(built.every((bi, n) => bank[bi].i === n) ? 3 : 1); // bank[].i = posição original do passo
  }
  const pickOption = (pos) => {
    if (phase !== 'ask' || hidden.has(pos)) return;
    picked = pos;
    finish(pos === item.correct ? 3 : 1);
  };
  const add = (i) => {
    if (phase === 'ask' && !built.includes(i)) built = [...built, i];
  };
  const removeAt = (n) => {
    if (phase === 'ask') built = built.filter((_, k) => k !== n);
  };
  const full = $derived(item.type === 'order' ? built.length === bank.length : built.length > 0);

  function onkey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target?.closest?.('a')) return;
    const k = e.key;
    if (phase === 'feedback') {
      if (item.type !== 'card' && (k === 'Enter' || k === ' ' || k === 'ArrowRight')) { e.preventDefault(); onnext(); }
      return;
    }
    if (k === 'h' || k === 'H') return useHint();
    if (item.type === 'card') {
      if (!revealed && (k === 'Enter' || k === ' ')) { e.preventDefault(); revealed = true; }
      else if (revealed && ['1', '2', '3', '4'].includes(k)) finish(Number(k));
    } else if (item.type === 'choice') {
      const n = /^[1-9]$/.test(k) ? Number(k) - 1 : -1;
      if (n >= 0 && n < item.order.length) pickOption(n);
    } else {
      if (k === 'Enter') { e.preventDefault(); check(); }
      else if (k === 'Backspace') removeAt(built.length - 1);
    }
  }

  const interval = (g) => fmtInterval(item.intervals[g - 1], lang);
</script>

<svelte:window onkeydown={onkey} />

<article class="q">
  <div class="tags">
    <span class="tag" class:new={item.isNew}>{item.retry ? s.retry : item.isNew ? s.newItem : s.review}</span>
    <span class="tag ghost">{item.unitIcon ?? ''} {L(item.unitTitle, lang).replace(/\s*\(\d+%\)$/, '')}</span>
  </div>

  <h1 class="prompt">{@html fmt(L(item.q, lang))}</h1>
  <div class="body" class:split={!!item.code}>
  {#if item.code}<pre class="codeblock"><code>{item.code}</code></pre>{/if}

  <div class="body-in">
  {#if item.type === 'card'}
    {#if revealed}
      <div class="answer">
        <div class="a-text">{@html fmt(L(item.a, lang))}</div>
        <a class="src" href={item.src} target="_blank" rel="noopener noreferrer">{s.source} ↗</a>
      </div>
    {/if}
  {:else if item.type === 'choice'}
    <ChoiceBody {item} {lang} {picked} {phase} {hidden} onpick={pickOption} />
  {:else}
    <p class="muted tiny">{item.type === 'command' ? s.tapTokens : s.tapSteps}</p>
    <Builder mode={item.type} {bank} {built} {phase} {ok} {expected} label={s.expected} onadd={add} onremove={removeAt} />
  {/if}
  </div>
  </div>

  {#if hinted && phase === 'ask'}<p class="hint" role="note">💡 {hintText} <span class="muted">{s.hintUsed}</span></p>{/if}
</article>

<div class="dock" class:good={phase === 'feedback' && ok} class:bad={phase === 'feedback' && !ok}>
  <div class="dock-in">
    {#if phase === 'feedback' && item.type !== 'card'}
      <div class="fb" role="status">
        <strong>{ok ? '✓' : '✗'} {title}</strong>
        <p>{@html fmt(L(item.why, lang))}</p>
        {#if hinted}<p class="tiny">{s.hintUsed}</p>{/if}
        <a class="src" href={item.src} target="_blank" rel="noopener noreferrer">{s.source} ↗</a>
      </div>
      <button class="btn primary big" onclick={onnext}>{s.continueBtn}</button>
    {:else if item.type === 'card'}
      {#if !revealed}
        <button class="btn primary big" onclick={() => (revealed = true)}>{s.reveal}</button>
      {:else}
        <div class="grades">
          {#each [[1, s.again], [2, s.hard], [3, s.good], [4, s.easy]] as [g, label]}
            <button class="g g{g}" onclick={() => finish(g)}>
              <kbd>{g}</kbd><span>{label}</span><small>{interval(g)}</small>
            </button>
          {/each}
        </div>
      {/if}
    {:else if item.type === 'choice'}
      {#if canHint}<button class="btn ghost" onclick={useHint}>💡 {s.hint}</button>{/if}
    {:else}
      <div class="cmd-actions">
        {#if canHint}<button class="btn ghost" onclick={useHint}>💡 {s.hint}</button>{/if}
        <button class="btn" onclick={() => (built = [])} disabled={!built.length}>{s.clear}</button>
        <button class="btn primary" onclick={check} disabled={!full}>{s.check}</button>
      </div>
    {/if}
    <p class="keys tiny muted">{s.keys}</p>
  </div>
</div>
