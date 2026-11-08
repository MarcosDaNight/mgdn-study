<script>
  import { fmt } from '$lib/i18n.js';
  // Monta uma sequência tocando nas peças: um comando (`mode="command"`, peças curtas num terminal)
  // ou os passos de um procedimento (`mode="order"`, uma lista numerada).
  // bank: [{ label }] na ordem embaralhada; built: índices do banco, na ordem escolhida.
  let { mode, bank, built, phase, ok, expected, label = '', onadd, onremove } = $props();
  const placed = $derived(built.map((i) => bank[i].label));
</script>

{#if mode === 'command'}
  <div class="slot" class:good={phase === 'feedback' && ok} class:bad={phase === 'feedback' && !ok} aria-live="polite">
    <span class="ps">$</span>
    {#each built as bi, n}
      <button class="tok placed" disabled={phase === 'feedback'} onclick={() => onremove(n)} aria-label="remover {bank[bi].label}">{bank[bi].label}</button>
    {/each}
    {#if !built.length && phase === 'ask'}<span class="caret"></span>{/if}
  </div>
  {#if phase === 'ask'}
    <div class="bank">
      {#each bank as tk, i}
        <button class="tok" disabled={built.includes(i)} onclick={() => onadd(i)}>{tk.label}</button>
      {/each}
    </div>
  {:else if !ok}
    <p class="exp-label tiny muted">{label}</p>
    <div class="slot good expected"><span class="ps">$</span>{#each expected as tk}<code class="tok placed">{tk}</code>{/each}</div>
  {/if}
{:else}
  <ol class="steps" class:good={phase === 'feedback' && ok} class:bad={phase === 'feedback' && !ok}>
    {#each built as bi, n}
      <li><button class="step placed" disabled={phase === 'feedback'} onclick={() => onremove(n)}><i class="n">{n + 1}</i><span>{@html fmt(bank[bi].label)}</span></button></li>
    {/each}
    {#if !built.length}<li class="empty">…</li>{/if}
  </ol>
  {#if phase === 'ask'}
    <div class="bank col">
      {#each bank as st, i}
        {#if !built.includes(i)}<button class="step" onclick={() => onadd(i)}><span>{@html fmt(st.label)}</span></button>{/if}
      {/each}
    </div>
  {:else if !ok}
    <p class="exp-label tiny muted">{label}</p>
    <ol class="steps good expected">
      {#each expected as st, n}<li><span class="step placed"><i class="n">{n + 1}</i><span>{@html fmt(st)}</span></span></li>{/each}
    </ol>
  {/if}
{/if}
