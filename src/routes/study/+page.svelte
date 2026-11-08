<script>
  import { t } from '$lib/i18n.js';
  import { XP, RETRY_XP } from '$lib/shared.js';
  import Exercise from '$lib/components/Exercise.svelte';
  import Ring from '$lib/components/Ring.svelte';
  import { onMount } from 'svelte';

  let { data } = $props();
  const s = $derived(t(data.lang));

  // A fila é um retrato da carga no momento de abrir a sessão: não reage a recargas de `data`.
  // svelte-ignore state_referenced_locally
  const MAX_RETRIES = 2;
  const total = data.queue.length;
  // svelte-ignore state_referenced_locally
  let queue = $state([...data.queue]);
  let completed = $state(0); // itens acertados (um item errado só conta quando acertar)
  let graded = $state(0);
  let right = $state(0);
  let xp = $state(0);
  let lastGrade = 0;
  let saveError = $state(false);
  // svelte-ignore state_referenced_locally
  const goalBefore = data.streak.todayReviews;

  const cur = $derived(queue[0]);
  const progress = $derived(total ? (completed / total) * 100 : 100);
  const goalReached = $derived(!data.streak.doneToday && goalBefore + graded >= data.streak.goal);

  // Respostas vão ao servidor em fila: se a rede cair, ficam guardadas e seguem quando voltar.
  const pending = [];
  let flushing = false;
  async function flush() {
    if (flushing) return;
    flushing = true;
    try {
      while (pending.length) {
        const res = await fetch('/api/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(pending[0])
        });
        if (res.ok || res.status === 400) pending.shift(); // 400: resposta inválida, descartar
        else throw new Error(String(res.status));
      }
      saveError = false;
    } catch {
      saveError = true;
    } finally {
      flushing = false;
    }
  }

  function onanswer({ grade, hinted }) {
    const retry = !!cur.retry;
    lastGrade = Math.min(grade, hinted ? 2 : 4);
    graded++;
    xp += retry ? RETRY_XP : XP[lastGrade];
    if (grade > 1) {
      right++;
      completed++;
    }
    pending.push({ id: cur.id, grade, hinted, retry });
    flush();
  }

  function onnext() {
    const it = queue[0];
    queue = queue.slice(1);
    // Errou: volta ao fim da fila, para recuperar da memória antes de terminar. No máximo 2 repetições:
    // a resposta já foi mostrada no feedback, e o item volta pelo agendamento (10 min).
    if (lastGrade === 1) {
      const tries = (it.tries ?? 0) + 1;
      if (tries <= MAX_RETRIES) queue.push({ ...it, isNew: false, retry: true, tries, uid: `${it.id}#${tries}` });
      else completed++;
    }
  }

  onMount(() => {
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  });

  const accuracy = $derived(graded ? Math.round((right / graded) * 100) : 0);
  const scopeQuery = $derived(data.scope.track ? `track=${data.scope.track}&` : '');
</script>

<svelte:head><title>{s.app} · {s.study}</title></svelte:head>

{#if total === 0}
  <section class="center card-surface finish">
    <div class="big-emoji">🌙</div>
    <h1>{s.nothing}</h1>
    <p class="muted">{s.nothingSub}</p>
    <a class="btn primary big" href="/study?{scopeQuery}more=1">{s.extra}</a>
    <a class="btn big" href="/">{s.home}</a>
  </section>
{:else if !cur}
  <section class="center card-surface finish">
    <div class="confetti" aria-hidden="true">{#each Array(14) as _, i}<i style="--i:{i}"></i>{/each}</div>
    <div class="big-emoji">{goalReached ? '🏆' : '🎉'}</div>
    <h1>{s.doneTitle}</h1>
    {#if goalReached}<p class="goal-pill">{s.goalReached}</p>{/if}
    <div class="done-stats">
      <div><b>+{xp}</b><span>{s.xpGained}</span></div>
      <div><b>{accuracy}%</b><span>{s.right}</span></div>
      <div><b>🔥 {data.streak.streak + (data.streak.doneToday || !goalReached ? 0 : 1)}</b><span>{s.streakDays(2)}</span></div>
    </div>
    <p class="muted">{s.doneSub}</p>
    {#if saveError}<p class="warn" role="alert">{s.savingFail}</p>{/if}
    <a class="btn primary big" href="/">{s.home}</a>
    <a class="btn big" href="/study?{scopeQuery}more=1">{s.extra}</a>
  </section>
{:else}
  <div class="session">
    <header class="sess-top">
      <a class="x" href="/" aria-label={s.exit}>✕</a>
      <div class="bar chunky" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100"><i style="width:{progress}%"></i></div>
      <span class="xp-pill">⚡ {xp}</span>
    </header>
    {#if saveError}<p class="warn" role="alert">{s.savingFail}</p>{/if}
    {#key cur.uid}
      <Exercise item={cur} lang={data.lang} {onanswer} {onnext} />
    {/key}
  </div>
{/if}
