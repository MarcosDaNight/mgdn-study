// Banco em memória e conteúdo de teste: precisam ser definidos antes de importar o código do app.
process.env.DB_PATH = ':memory:';
process.env.CONTENT_DIR = new URL('./fixtures', import.meta.url).pathname;
