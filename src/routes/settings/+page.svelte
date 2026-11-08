<script>
  import { enhance } from '$app/forms';
  import { t } from '$lib/i18n.js';
  let { data, form } = $props();
  const s = $derived(t(data.lang));
  // Estado inicial do formulário; depois o aluno é quem muda.
  // svelte-ignore state_referenced_locally
  let goal = $state(data.goal);
  // svelte-ignore state_referenced_locally
  let newPerDay = $state(data.newPerDay);
</script>

<svelte:head><title>{s.app} · {s.settings}</title></svelte:head>

<h1 class="page-title">{s.settings}</h1>

<form method="POST" use:enhance class="card-surface settings">
  <fieldset>
    <legend>{s.dailyGoal}</legend>
    <p class="muted tiny">{s.dailyGoalHelp}</p>
    <div class="seg">
      {#each data.goals as g}
        <label class:on={goal === g}><input type="radio" name="goal" value={g} bind:group={goal} />{g}</label>
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend>{s.newPerDay}</legend>
    <p class="muted tiny">{s.newPerDayHelp}</p>
    <div class="seg">
      {#each data.newLimits as n}
        <label class:on={newPerDay === n}><input type="radio" name="newPerDay" value={n} bind:group={newPerDay} />{n}</label>
      {/each}
    </div>
  </fieldset>
  <button class="btn primary big" type="submit">{s.save}</button>
  {#if form?.saved}<p class="saved" role="status">✓ {s.saved}</p>{/if}
</form>

<p class="muted tiny center-t">{s.content(data.items)} · <a href="https://github.com/MarcosDaNight/mgdn-study">mgdn-study</a></p>
