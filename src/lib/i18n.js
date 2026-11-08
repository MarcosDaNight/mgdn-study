export const dict = {
  pt: {
    app: 'Timoneiro', home: 'Início', study: 'Estudar', settings: 'Ajustes',
    streakDays: (n) => (n === 1 ? 'dia seguido' : 'dias seguidos'),
    streakZero: 'Comece hoje a sua sequência',
    streakKeep: 'Estude hoje para manter a sequência',
    streakDone: 'Meta de hoje batida',
    freezes: 'congelar', freezeHint: 'Um congelar salva a sequência se você perder 1 dia. Você ganha 1 a cada 7 dias seguidos (máx. 2).',
    todayGoal: 'Meta de hoje', answersOf: (a, b) => `${a} de ${b} respostas`,
    goalDone: 'Meta batida! Cada resposta extra fortalece a memória.',
    goalLeft: (n) => (n === 1 ? 'Falta 1 resposta' : `Faltam ${n} respostas`),
    start: 'Começar', continue: 'Continuar', extra: 'Treino extra',
    toReview: 'para revisar', learned: 'aprendidos', mastered: 'dominados', accuracy: 'acertos (7 dias)',
    masteredHint: 'Dominado = você lembraria por 3 semanas ou mais.',
    nextUnit: 'Próxima', dueN: (n) => `${n} p/ revisar`, unitCount: (a, b) => `${a}/${b}`,
    newToday: (n) => `${n} novos hoje`, howTitle: 'Como funciona',
    howText: 'Cada item volta quando você está prestes a esquecê-lo (FSRS, o algoritmo moderno do Anki). Errar é parte do processo: o item volta antes. Poucos itens novos por dia, de propósito: aprender pouco e revisar sempre vence a maratona.',
    // sessão
    reveal: 'Mostrar resposta', check: 'Verificar', clear: 'Limpar', continueBtn: 'Continuar',
    hint: 'Dica', hintUsed: 'Com dica a nota máxima é Difícil.',
    again: 'Errei', hard: 'Difícil', good: 'Bom', easy: 'Fácil',
    correctT: ['Correto!', 'Isso aí!', 'Mandou bem!', 'Certo!'], wrongT: ['Quase lá.', 'Não foi dessa vez.', 'Vale rever:'],
    yourAnswer: 'Sua resposta', expected: 'Resposta esperada', source: 'Fonte na documentação',
    newItem: 'Novo', review: 'Revisão', retry: 'Mais uma vez',
    tapTokens: 'Monte o comando tocando nas peças', tapSteps: 'Toque nos passos na ordem certa',
    hintCmd: (first, n) => `Começa com ${first} e tem ${n} peças.`, hintOrder: (s) => `O primeiro passo é: ${s}`,
    hintChoice: 'Eliminei duas opções erradas.',
    keys: 'Atalhos: Espaço/Enter · 1–4 · H dica · Backspace desfaz',
    exit: 'Sair da sessão', savingFail: 'Sem conexão: suas respostas serão salvas quando voltar.',
    doneTitle: 'Sessão concluída!', doneSub: 'Voltar amanhã vale mais do que ficar horas hoje: a memória se firma com intervalos.',
    xpGained: 'XP', right: 'acertos', answers: 'respostas', goalReached: 'Meta do dia batida!',
    nothing: 'Nada para estudar agora', nothingSub: 'As próximas revisões chegam na hora certa. Quer treinar mais um pouco?',
    // ajustes
    language: 'Idioma', dailyGoal: 'Meta diária', dailyGoalHelp: 'Respostas por dia para manter a sequência.',
    newPerDay: 'Itens novos por dia', newPerDayHelp: 'Menos novos, mais revisão: ótimo para fixar. Mais novos: avança rápido, mas acumula revisões.',
    save: 'Salvar', saved: 'Salvo!', content: (n) => `${n} itens no currículo`,
    notFound: 'Página não encontrada', notFoundSub: 'Esse endereço não existe por aqui.', error: 'Algo deu errado',
    toHome: 'Voltar ao início'
  },
  en: {
    app: 'Timoneiro', home: 'Home', study: 'Study', settings: 'Settings',
    streakDays: (n) => (n === 1 ? 'day streak' : 'day streak'),
    streakZero: 'Start your streak today',
    streakKeep: 'Study today to keep your streak',
    streakDone: "Today's goal reached",
    freezes: 'freeze', freezeHint: 'A freeze saves your streak if you miss 1 day. You earn 1 every 7 days in a row (max 2).',
    todayGoal: "Today's goal", answersOf: (a, b) => `${a} of ${b} answers`,
    goalDone: 'Goal reached! Every extra answer strengthens memory.',
    goalLeft: (n) => (n === 1 ? '1 answer to go' : `${n} answers to go`),
    start: 'Start', continue: 'Continue', extra: 'Extra practice',
    toReview: 'to review', learned: 'learned', mastered: 'mastered', accuracy: 'accuracy (7 days)',
    masteredHint: 'Mastered = you would remember it for 3 weeks or more.',
    nextUnit: 'Next', dueN: (n) => `${n} to review`, unitCount: (a, b) => `${a}/${b}`,
    newToday: (n) => `${n} new today`, howTitle: 'How it works',
    howText: 'Each item returns just as you are about to forget it (FSRS, the modern Anki algorithm). Getting it wrong is part of the process: it comes back sooner. Few new items per day, on purpose: learning a little and reviewing always beats cramming.',
    reveal: 'Show answer', check: 'Check', clear: 'Clear', continueBtn: 'Continue',
    hint: 'Hint', hintUsed: 'With a hint the best grade is Hard.',
    again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy',
    correctT: ['Correct!', 'Nice one!', 'Well done!', 'Right!'], wrongT: ['Almost there.', 'Not this time.', 'Worth another look:'],
    yourAnswer: 'Your answer', expected: 'Expected answer', source: 'Source in the docs',
    newItem: 'New', review: 'Review', retry: 'One more time',
    tapTokens: 'Build the command by tapping the pieces', tapSteps: 'Tap the steps in the right order',
    hintCmd: (first, n) => `It starts with ${first} and has ${n} pieces.`, hintOrder: (s) => `The first step is: ${s}`,
    hintChoice: 'I removed two wrong options.',
    keys: 'Shortcuts: Space/Enter · 1–4 · H hint · Backspace undoes',
    exit: 'Leave session', savingFail: 'Offline: your answers will be saved when you are back.',
    doneTitle: 'Session complete!', doneSub: 'Coming back tomorrow beats cramming today: memory sets with spacing.',
    xpGained: 'XP', right: 'correct', answers: 'answers', goalReached: "Today's goal reached!",
    nothing: 'Nothing to study right now', nothingSub: 'The next reviews arrive right on time. Want some extra practice?',
    language: 'Language', dailyGoal: 'Daily goal', dailyGoalHelp: 'Answers per day to keep your streak.',
    newPerDay: 'New items per day', newPerDayHelp: 'Fewer new, more review: great for retention. More new: faster, but reviews pile up.',
    save: 'Save', saved: 'Saved!', content: (n) => `${n} items in the curriculum`,
    notFound: 'Page not found', notFoundSub: 'That address does not exist here.', error: 'Something went wrong',
    toHome: 'Back to home'
  }
};

export const t = (lang) => dict[lang] ?? dict.pt;
export const L = (obj, lang) => obj?.[lang] ?? obj?.pt;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Texto do currículo -> HTML seguro: escapa e só então aplica `código` e **negrito**. */
export const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

/** "10 min", "4 d", "2 meses": quando o item volta (prévia nos botões de nota). */
export function fmtInterval(ms, lang) {
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${Math.max(1, min)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d`;
  const mo = Math.round(d / 30);
  if (mo < 12) return lang === 'en' ? `${mo} mo` : mo === 1 ? '1 mês' : `${mo} meses`;
  const y = Math.round((d / 365) * 10) / 10;
  return lang === 'en' ? `${y} y` : `${y} ${y === 1 ? 'ano' : 'anos'}`;
}
