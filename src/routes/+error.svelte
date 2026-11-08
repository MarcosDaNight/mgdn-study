<script>
  import { page } from '$app/state';
  const pt = !/^en/i.test(globalThis.document?.documentElement.lang ?? 'pt');
  const nf = $derived(page.status === 404);
</script>

<svelte:head><title>{page.status} · Estudo</title></svelte:head>

<section class="center card-surface">
  <div class="big-emoji">{nf ? '🧭' : '🛠️'}</div>
  <h1>{nf ? (pt ? 'Página não encontrada' : 'Page not found') : pt ? 'Algo deu errado' : 'Something went wrong'}</h1>
  <p class="muted">{nf ? (pt ? 'Esse endereço não existe por aqui.' : 'That address does not exist here.') : page.error?.message}</p>
  <a class="btn primary" href="/">{pt ? 'Voltar ao início' : 'Back to home'}</a>
</section>
