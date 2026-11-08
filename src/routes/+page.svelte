<script>
  import { t, L } from '$lib/i18n.js';
  let { data } = $props();
  const s = $derived(t(data.lang));
  const st = $derived(data.streak);
  const pct = $derived(Math.min(100, Math.round((st.todayReviews / st.goal) * 100)));
  const left = $derived(Math.max(0, st.goal - st.todayReviews));
  const wd = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString(data.lang === 'en' ? 'en' : 'pt-BR', { weekday: 'narrow', timeZone: 'UTC' });
  const nothing = $derived(data.counts.due === 0 && data.counts.newLeft === 0);
</script>

<svelte:head><title>{s.app} · {s.home}</title></svelte:head>

<section class="hero card-surface">
  <div class="flame" class:lit={st.doneToday} aria-hidden="true">🔥</div>
  <div class="hero-n">
    <strong>{st.streak}</strong>
    <span>{st.streak === 1 ? s.streakOne : s.streak}</span>
  </div>
  <ol class="week" aria-label={s.lastDays}>
    {#each st.week as d}
      <li class={d.state}><i></i><small>{wd(d.day)}</small></li>
    {/each}
  </ol>
  <p class="muted tiny" title={s.freezeHint}>❄ {st.freezes} {s.freezes}</p>
</section>

<section class="card-surface goal">
  <div class="row">
    <h2>{s.todayGoal}</h2>
    <span class="muted">{st.todayReviews}/{st.goal} · {st.todayXp} {s.xp}</span>
  </div>
  <div class="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style="width:{pct}%"></i></div>
  <p class="muted">{st.doneToday ? s.goalDone : s.goalLeft(left)}</p>
</section>

<section class="cta">
  <div class="chips">
    <span class="chip"><b>{data.counts.due}</b> {s.due}</span>
    <span class="chip"><b>{data.counts.newLeft}</b> {s.fresh}</span>
  </div>
  {#if nothing}
    <p class="muted">{s.nothingSub}</p>
  {:else}
    <a class="btn primary big" href="/study">{s.start}</a>
  {/if}
</section>

{#each data.tracks as tr}
  <section class="card-surface track">
    <div class="row">
      <h2>{L(tr.title, data.lang)}</h2>
      <a class="link" href="/study?track={tr.track}">{s.study} →</a>
    </div>
    <ul class="units">
      {#each tr.units as u}
        <li>
          <div class="row">
            <span>{L(u.title, data.lang)}</span>
            <span class="muted tiny">{u.learned}/{u.total} {s.learned}{u.mastered ? ` · ${u.mastered} ${s.mastered}` : ''}</span>
          </div>
          <div class="bar thin" title={s.masteredHint}>
            <i class="l" style="width:{(u.learned / u.total) * 100}%"></i>
            <i class="m" style="width:{(u.mastered / u.total) * 100}%"></i>
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<details class="card-surface how">
  <summary>{s.how}</summary>
  <p class="muted">{s.howText}</p>
</details>
