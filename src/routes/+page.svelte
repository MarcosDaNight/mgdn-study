<script>
  import { t, L } from '$lib/i18n.js';
  import Ring from '$lib/components/Ring.svelte';

  let { data } = $props();
  const s = $derived(t(data.lang));
  const st = $derived(data.streak);
  const goalPct = $derived(st.todayReviews / st.goal);
  const left = $derived(Math.max(0, st.goal - st.todayReviews));
  const nothing = $derived(data.counts.due === 0 && data.counts.newLeft === 0);
  const started = $derived(st.todayReviews > 0 && !st.doneToday);
  const weekday = (d) =>
    new Date(d + 'T12:00:00Z').toLocaleDateString(data.lang === 'en' ? 'en' : 'pt-BR', { weekday: 'narrow', timeZone: 'UTC' });
  const cleanTitle = (title) => L(title, data.lang).replace(/\s*\(\d+%\)$/, '');
  const weight = (title) => L(title, data.lang).match(/\((\d+%)\)$/)?.[1];
</script>

<svelte:head><title>{s.app} · {s.home}</title></svelte:head>

<div class="home">
  <div class="home-side">
    <section class="hero" class:lit={st.doneToday}>
      <div class="hero-top">
        <div class="flame" aria-hidden="true">🔥</div>
        <div>
          <div class="hero-n"><strong>{st.streak}</strong> <span>{s.streakDays(st.streak)}</span></div>
          <p class="hero-sub">{st.streak === 0 && !st.doneToday ? s.streakZero : st.doneToday ? s.streakDone : s.streakKeep}</p>
        </div>
      </div>
      <ol class="week" aria-label="7">
        {#each st.week as d}
          <li class="{d.state}" class:today={d.today}><i>{d.state === 'done' ? '✓' : d.state === 'frozen' ? '❄' : ''}</i><small>{weekday(d.day)}</small></li>
        {/each}
      </ol>
      <p class="freeze" title={s.freezeHint}>❄ {st.freezes} {s.freezes}</p>
    </section>

    <section class="card-surface goal">
      <Ring value={goalPct} size={84} stroke={9} label={s.todayGoal}>
        <b>{st.todayReviews}</b><small>/{st.goal}</small>
      </Ring>
      <div class="goal-t">
        <h2>{s.todayGoal}</h2>
        <p class="muted">{st.doneToday ? s.goalDone : s.goalLeft(left)}</p>
        <p class="tiny muted">{s.answersOf(st.todayReviews, st.goal)} · {st.todayXp} XP</p>
      </div>
    </section>

    <section class="cta">
      {#if nothing}
        <p class="muted center-t">{s.nothingSub}</p>
        <a class="btn primary big" href="/study?more=1">{s.extra}</a>
      {:else}
        <a class="btn primary big" href="/study">{started ? s.continue : s.start}</a>
        <p class="tiny muted center-t">{data.counts.due} {s.toReview} · {s.newToday(data.counts.newLeft)}</p>
        {#if st.doneToday}<a class="btn big" href="/study?more=1">{s.extra}</a>{/if}
      {/if}
    </section>

    <section class="stats">
      <div><b>{data.counts.learned}</b><span>{s.learned}</span></div>
      <div><b>{data.tracks.reduce((a, tr) => a + tr.units.reduce((x, u) => x + u.mastered, 0), 0)}</b><span>{s.mastered}</span></div>
      <div><b>{data.overview.accuracy === null ? '–' : data.overview.accuracy + '%'}</b><span>{s.accuracy}</span></div>
    </section>
  </div>

  <div class="home-main">
    {#each data.tracks as tr}
      <section class="track">
        <div class="row">
          <h2>{L(tr.title, data.lang)}</h2>
          <a class="link" href="/study?track={tr.track}">{s.study} →</a>
        </div>
        <ul class="units">
          {#each tr.units as u}
            <li>
              <a class="unit card-surface" class:current={u.current} href="/study?unit={u.id}">
                <Ring value={u.learned / u.total} size={52} stroke={5} label="{u.learned}/{u.total}"><span class="uico">{u.icon}</span></Ring>
                <div class="unit-t">
                  <strong>{cleanTitle(u.title)}</strong>
                  <span class="muted tiny">
                    {s.unitCount(u.learned, u.total)} {s.learned}{u.mastered ? ` · ${u.mastered} ${s.mastered}` : ''}{weight(u.title) ? ` · ${weight(u.title)} CKA` : ''}
                  </span>
                  <div class="bar thin" title={s.masteredHint}>
                    <i class="l" style="width:{(u.learned / u.total) * 100}%"></i>
                    <i class="m" style="width:{(u.mastered / u.total) * 100}%"></i>
                  </div>
                </div>
                {#if u.due}<span class="badge due">{s.dueN(u.due)}</span>
                {:else if u.current}<span class="badge">{s.nextUnit}</span>{/if}
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}

    <details class="card-surface how">
      <summary>{s.howTitle}</summary>
      <p class="muted">{s.howText}</p>
    </details>
  </div>
</div>
