import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(db: SQLiteDatabase) {
    try {
        // Ativa o suporte a chaves estrangeiras (Foreign Keys)
        await db.execAsync(`PRAGMA journal_mode = WAL;`);
        await db.execAsync(`PRAGMA foreign_keys = ON;`);

        await db.execAsync(`
            -- Tabela de Grupos
            CREATE TABLE IF NOT EXISTS grupos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                hora_inicio TEXT NOT NULL,
                hora_fim TEXT NOT NULL,
                cor TEXT NOT NULL,
                ordem INTEGER DEFAULT 0
            );

            -- Tabela de Tarefas
            CREATE TABLE IF NOT EXISTS tarefas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                grupo_id INTEGER NOT NULL,
                alarme_hora TEXT,
                concluida INTEGER DEFAULT 0,
                criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                ordem INTEGER DEFAULT 0,
                FOREIGN KEY (grupo_id) REFERENCES grupos (id) ON DELETE CASCADE
            );

            -- Tabela de Ligação (N:N) - Dias da Semana
            CREATE TABLE IF NOT EXISTS tarefa_dias (
                tarefa_id INTEGER NOT NULL,
                dia_semana INTEGER NOT NULL, -- Sugestão: 0 (Dom) a 6 (Sab)
                PRIMARY KEY (tarefa_id, dia_semana),
                FOREIGN KEY (tarefa_id) REFERENCES tarefas (id) ON DELETE CASCADE
            );

            -- Tabela de check-in de tarefas (N:N) - Sessões de Check-in
            CREATE TABLE IF NOT EXISTS tarefa_check_sessao (
                tarefa_id INTEGER NOT NULL,
                grupo_id INTEGER NOT NULL,
                data TEXT NOT NULL, -- formato YYYY-MM-DD (o dia em que foi marcada)
                PRIMARY KEY (tarefa_id, grupo_id, data),
                FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
                FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
            );
        `);
        await addColumnIfNotExists(db, "grupos", "ordem", "INTEGER DEFAULT 0");
        await addColumnIfNotExists(db, "tarefas", "ordem", "INTEGER DEFAULT 0");
        await addColumnIfNotExists(
            db,
            "tarefa_dias",
            "ordem",
            "INTEGER DEFAULT NULL",
        );

        console.log("Banco de dados e tabelas sincronizados com sucesso!");
        // No seu componente principal ou no init do banco
        console.log("Caminho do banco:", db.databasePath);
    } catch (error) {
        console.log("Erro ao inicializar banco de dados:", error);
    }
}

async function addColumnIfNotExists(
    db: SQLiteDatabase,
    table: string,
    column: string,
    definition: string,
) {
    const columns = await db.getAllAsync<{ name: string }>(
        `PRAGMA table_info(${table})`,
    );
    const exists = columns.some((c) => c.name === column);
    if (!exists) {
        await db.execAsync(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        );
        console.log(`Coluna '${column}' adicionada em '${table}'`);
    }
}
