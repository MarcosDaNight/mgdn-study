<script>
  // Anel de progresso (0..1). O conteúdo do centro vem como filho.
  let { value = 0, size = 64, stroke = 7, children, label = '' } = $props();
  const r = $derived((size - stroke) / 2);
  const c = $derived(2 * Math.PI * r);
  const v = $derived(Math.min(1, Math.max(0, value)));
</script>

<div class="ring" style="width:{size}px;height:{size}px" role="img" aria-label={label}>
  <svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
    <circle class="track" cx={size / 2} cy={size / 2} {r} stroke-width={stroke} fill="none" />
    <circle
      class="fill" cx={size / 2} cy={size / 2} {r} stroke-width={stroke} fill="none"
      stroke-linecap="round" stroke-dasharray={c} stroke-dashoffset={c * (1 - v)}
      transform="rotate(-90 {size / 2} {size / 2})"
    />
  </svg>
  <div class="ring-in">{@render children?.()}</div>
</div>
