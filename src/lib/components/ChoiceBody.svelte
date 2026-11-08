<script>
  import { fmt } from '$lib/i18n.js';
  // Múltipla escolha. `order` embaralha as opções; `hidden` guarda as eliminadas pela dica.
  let { item, lang, picked, phase, hidden, onpick } = $props();
</script>

<ul class="opts">
  {#each item.order as oi, pos}
    {@const isRight = pos === item.correct}
    <li class:gone={hidden.has(pos)}>
      <button
        class="opt"
        class:good={phase === 'feedback' && isRight}
        class:bad={phase === 'feedback' && picked === pos && !isRight}
        disabled={phase === 'feedback' || hidden.has(pos)}
        onclick={() => onpick(pos)}
      >
        <kbd>{pos + 1}</kbd>
        <span>{@html fmt(item.options[lang][oi])}</span>
      </button>
    </li>
  {/each}
</ul>
