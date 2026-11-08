# mgdn-study

App de estudo para a **CKA** e para os **fundamentos de Linux**, com repetição espaçada,
trilha por domínio, streak e meta diária. Interface em **português e inglês**, responsiva
(celular com uma mão; desktop com atalhos de teclado) e instalável como PWA.

Roda na [mgdn-platform](https://github.com/MarcosDaNight/mgdn-platform), só pela tailnet.

## Como ensina

| Princípio | Como aparece no app |
|---|---|
| **Repetição espaçada** | FSRS-4.5 (o algoritmo moderno do Anki) agenda cada item para quando você está prestes a esquecer; meta de 90% de retenção. Os botões do cartão mostram a prévia ("Bom · 6 d"). |
| **Recuperação ativa** | Você tenta responder *antes* de ver a resposta. Errou? O item volta ao fim da sessão (até 2 vezes) e pelo agendamento em 10 min. Só a 1ª tentativa reagenda o FSRS: repetir um erro minutos depois é prática, não evidência de retenção. |
| **Feedback imediato** | Todo exercício mostra o porquê da resposta e o link da documentação oficial. |
| **Andaimes (dica)** | O botão 💡 elimina opções erradas, mostra o 1º passo ou a 1ª peça do comando. Com dica, a nota máxima é "Difícil": pedir ajuda não finge domínio. |
| **Prática intercalada** | Uma novidade a cada ~3 revisões, alternando CKA e Linux, em vez de blocos do mesmo assunto. |
| **Carga controlada** | 8 itens novos por dia por padrão (4 a 16 em Ajustes): aprender pouco e revisar sempre. O treino extra soma mais novos e adianta revisões. |
| **Fazer, não só ler** | Quatro formatos: cartão, múltipla escolha (inclusive com YAML para achar o erro), **montar o comando** tocando nas peças e **ordenar os passos** de um procedimento. |
| **Hábito** | Meta diária (5/10/20/30), sequência de dias e "congelar" (1 a cada 7 dias seguidos, máx. 2). A sequência é calculada do histórico, sem gravar nada ao ler. |

"Dominado" significa estabilidade ≥ 21 dias: você lembraria por 3 semanas ou mais.

## Conteúdo

**198 itens** (131 de CKA nos 5 domínios da prova, 67 de Linux), em PT e EN, cada um com a fonte
oficial. O currículo vive em [`content/`](content), em YAML versionado: uma pasta por trilha e um
arquivo por unidade (a ordem do nome é a ordem da trilha).

```
content/
  cka/
    _track.yaml            # título da trilha
    00-exam.yaml           # Prova e kubectl veloz
    10-architecture.yaml   # Control plane e kubeadm (25%)
    ...
  linux/
    01-files.yaml ...
```

A documentação do Kubernetes é
[CC BY 4.0](https://github.com/kubernetes/website/blob/main/LICENSE), então o link de
atribuição acompanha cada item. **Os `id`s são a chave do progresso: nunca os renomeie**
(mover um item entre unidades é seguro).

```yaml
- id: cka-logs-previous
  type: command            # card | choice | command | order
  q: { pt: "...", en: "..." }
  answer: [kubectl, logs, api, "--previous"]   # peças na ordem certa
  alts:                                         # formas equivalentes também aceitas
    - [kubectl, logs, api, "-p"]
  extra: ["-f", describe, "-p"]                 # distratores (e as peças das alts)
  why: { pt: "...", en: "..." }
  src: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/
```

| Tipo | Campos |
|---|---|
| `card` | `a` (resposta) |
| `choice` | `options` (pt/en), `correct` (índice), `why`; `code` opcional mostra um bloco de YAML |
| `command` | `answer`, `alts`, `extra`, `why` |
| `order` | `steps` (pt/en, **na ordem certa**; o app embaralha), `why` |

`npm run check:content` valida o currículo (idiomas completos, fonte presente, ids únicos,
alternativas alcançáveis) e roda no CI e no build da imagem.

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # FSRS, streak, sessão e conteúdo
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
