# mgdn-study

App de estudo para a **CKA** e para os **fundamentos de Linux**, com repetição espaçada,
trilha por domínio, streak e meta diária. Interface em **português e inglês**, responsiva
(celular com uma mão; desktop com atalhos de teclado) e instalável como PWA.

Roda na [mgdn-platform](https://github.com/MarcosDaNight/mgdn-platform), só pela tailnet.

## Como ensina

| Princípio | Como aparece no app |
|---|---|
| **Repetição espaçada** | FSRS-4.5 (o algoritmo moderno do Anki) agenda cada item para quando você está prestes a esquecer; meta de 90% de retenção. |
| **Recuperação ativa** | Você tenta responder *antes* de ver a resposta. Errou? O item volta ao fim da mesma sessão até acertar. |
| **Feedback imediato** | Todo exercício mostra o porquê da resposta e o link da documentação oficial. |
| **Prática intercalada** | Uma novidade a cada ~3 revisões, misturando temas, em vez de blocos do mesmo assunto. |
| **Carga controlada** | No máximo 8 itens novos por dia: aprender pouco e revisar sempre. |
| **Fazer, não só ler** | Três formatos: cartão, múltipla escolha e **montar o comando** tocando nas peças (como na prova). |
| **Hábito** | Meta diária, streak em dias consecutivos e "congelar" (1 a cada 7 dias seguidos, máx. 2). |

"Dominado" significa estabilidade ≥ 21 dias: você lembraria por 3 semanas ou mais.

## Conteúdo

O currículo vive em [`content/`](content), em YAML versionado. Cada item tem texto em `pt` e
`en` e um `src` obrigatório com a página de origem. A documentação do Kubernetes é
[CC BY 4.0](https://github.com/kubernetes/website/blob/main/LICENSE), então o link de
atribuição acompanha cada item.

```yaml
- id: cka-logs-previous
  type: command            # card | choice | command
  q: { pt: "...", en: "..." }
  answer: [kubectl, logs, api, "--previous"]   # peças na ordem certa
  extra: ["-f", describe]                      # distratores
  why: { pt: "...", en: "..." }
  src: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/
```

`npm run check:content` valida o currículo (idiomas completos, fonte presente, ids únicos) e
roda no CI e no build da imagem.

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # FSRS
npm run check:content
```

Requer Node ≥ 22.13 (usa o `node:sqlite` embutido, sem dependência nativa).

| Variável | Padrão | Para quê |
|---|---|---|
| `DB_PATH` | `./data/study.sqlite` | arquivo SQLite (progresso) |
| `CONTENT_DIR` | `./content` | currículo |
| `TZ` | `America/Sao_Paulo` | fuso do "dia" do streak |
| `ORIGIN` | — | URL pública (obrigatória atrás de proxy, p. ex. `https://estudo.mgdn.com.br`) |

## Imagem

O CI builda, roda o Trivy (bloqueia CRITICAL com correção), faz um smoke test em `/healthz` e,
na `main`, publica em `ghcr.io/marcosdanight/mgdn-study`. O digest sai no resumo do job; é ele
que a plataforma fixa no `compose.yaml`.
