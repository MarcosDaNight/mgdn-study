export const dict = {
  pt: {
    app: 'Estudo', home: 'Início', study: 'Estudar', path: 'Trilha',
    streak: 'dias seguidos', streakOne: 'dia seguido', todayGoal: 'Meta de hoje',
    goalDone: 'Meta batida! Cada revisão extra fortalece a memória.',
    goalLeft: (n) => `Faltam ${n} para manter o streak`,
    start: 'Começar', continue: 'Continuar', due: 'para revisar', fresh: 'novos hoje',
    freezes: 'congelar', freezeHint: 'Um congelar salva o streak se você perder 1 dia. Ganha-se 1 a cada 7 dias seguidos.',
    reveal: 'Mostrar resposta', check: 'Verificar', next: 'Próximo', clear: 'Limpar',
    again: 'Errei', hard: 'Difícil', good: 'Bom', easy: 'Fácil',
    correct: 'Correto!', wrong: 'Quase. Veja o porquê:', yourAnswer: 'Sua resposta', expected: 'Esperado',
    source: 'Fonte', newItem: 'Novo', review: 'Revisão',
    learnFirst: 'Novo conceito: leia, tente responder e confira.',
    tapTokens: 'Monte o comando tocando nas peças',
    doneTitle: 'Sessão concluída', doneSub: 'Voltar amanhã vale mais que ficar horas hoje: a memória se firma com intervalos.',
    nothing: 'Nada para estudar agora', nothingSub: 'Volte mais tarde: as próximas revisões chegam no tempo certo.',
    xp: 'XP', accuracy: 'acertos', learned: 'aprendidos', mastered: 'dominados',
    masteredHint: 'Dominado = você lembraria por 3+ semanas.',
    language: 'Idioma', lastDays: 'Últimos 7 dias', all: 'Tudo', track: 'Trilha',
    how: 'Como funciona',
    howText: 'Cada item reaparece quando você está prestes a esquecer (FSRS, o algoritmo moderno do Anki). Errar não é ruim: o item volta antes. Itens novos são poucos por dia, de propósito.',
    keys: 'Atalhos: Espaço/Enter revela · 1–4 avalia · ← → navega'
  },
  en: {
    app: 'Study', home: 'Home', study: 'Study', path: 'Path',
    streak: 'day streak', streakOne: 'day streak', todayGoal: "Today's goal",
    goalDone: 'Goal reached! Every extra review strengthens memory.',
    goalLeft: (n) => `${n} to go to keep your streak`,
    start: 'Start', continue: 'Continue', due: 'to review', fresh: 'new today',
    freezes: 'freeze', freezeHint: 'A freeze saves your streak if you miss 1 day. You earn 1 every 7 days in a row.',
    reveal: 'Show answer', check: 'Check', next: 'Next', clear: 'Clear',
    again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy',
    correct: 'Correct!', wrong: 'Close. Here is why:', yourAnswer: 'Your answer', expected: 'Expected',
    source: 'Source', newItem: 'New', review: 'Review',
    learnFirst: 'New concept: read it, try to answer, then check.',
    tapTokens: 'Build the command by tapping the pieces',
    doneTitle: 'Session complete', doneSub: 'Coming back tomorrow beats cramming today: memory sets with spacing.',
    nothing: 'Nothing to study right now', nothingSub: 'Come back later: the next reviews arrive right on time.',
    xp: 'XP', accuracy: 'accuracy', learned: 'learned', mastered: 'mastered',
    masteredHint: 'Mastered = you would remember it for 3+ weeks.',
    language: 'Language', lastDays: 'Last 7 days', all: 'All', track: 'Track',
    how: 'How it works',
    howText: 'Each item returns just as you are about to forget it (FSRS, the modern Anki algorithm). Getting it wrong is fine: it comes back sooner. New items are few per day, on purpose.',
    keys: 'Shortcuts: Space/Enter reveals · 1–4 grades · ← → navigates'
  }
};

export const t = (lang) => dict[lang] ?? dict.pt;
export const L = (obj, lang) => obj?.[lang] ?? obj?.pt;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Texto do currículo -> HTML seguro: escapa e só então aplica `código` e **negrito**. */
export const fmt = (s) =>
  esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
