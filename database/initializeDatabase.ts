import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(db: SQLiteDatabase) {
    try {
        // Ativa o suporte a chaves estrangeiras (Foreign Keys)
        await db.execAsync(`PRAGMA foreign_keys = ON;`);

        await db.execAsync(`
            -- Tabela de Grupos
            CREATE TABLE IF NOT EXISTS grupos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                hora_inicio TEXT NOT NULL,
                hora_fim TEXT NOT NULL,
                cor TEXT NOT NULL
            );

            -- Tabela de Tarefas
            CREATE TABLE IF NOT EXISTS tarefas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                grupo_id INTEGER NOT NULL,
                alarme_hora TEXT,
                concluida INTEGER DEFAULT 0, -- 0 = false, 1 = true
                criada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (grupo_id) REFERENCES grupos (id) ON DELETE CASCADE
            );

            -- Tabela de Ligação (N:N) - Dias da Semana
            CREATE TABLE IF NOT EXISTS tarefa_dias (
                tarefa_id INTEGER NOT NULL,
                dia_semana INTEGER NOT NULL, -- Sugestão: 0 (Dom) a 6 (Sab)
                PRIMARY KEY (tarefa_id, dia_semana),
                FOREIGN KEY (tarefa_id) REFERENCES tarefas (id) ON DELETE CASCADE
            );
        `);

        console.log("Banco de dados e tabelas sincronizados com sucesso!");
    } catch (error) {
        console.log("Erro ao inicializar banco de dados:", error);
    }
}
