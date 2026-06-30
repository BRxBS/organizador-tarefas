import { DAY_AMANHA, DAY_HOJE } from "@/util/days";
import { useSQLiteContext } from "expo-sqlite";

export type TaskDatabase = {
    id: number;
    nome: string;
    descricao: string | null;
    grupo_id: number;
    alarme_hora: string | null;
    concluida: number;
    grupo_nome?: string; // Para quando fizermos JOIN
};

export function useTaskDatabase() {
    const db = useSQLiteContext();

    async function create(data: {
        nome: string;
        descricao: string | null;
        grupo_id: number;
        alarme_hora: string | null;
        dias: number[];
    }) {
        // 1. Criamos uma variável fora do escopo da transação
        let insertedId: number | null = null;

        try {
            await db.withTransactionAsync(async () => {
                // 2. Inserir a Tarefa
                const result = await db.runAsync(
                    "INSERT INTO tarefas (nome, descricao, grupo_id, alarme_hora) VALUES (?, ?, ?, ?)",
                    [
                        data.nome,
                        data.descricao,
                        data.grupo_id,
                        data.alarme_hora,
                    ],
                );

                // 3. Atribuímos o ID à nossa variável externa
                insertedId = result.lastInsertRowId;

                // 4. Inserir os Dias vinculados
                for (const dia of data.dias) {
                    await db.runAsync(
                        "INSERT INTO tarefa_dias (tarefa_id, dia_semana) VALUES (?, ?)",
                        [insertedId, dia],
                    );
                }

                // Note que aqui não damos "return". A transação termina e retorna void.
            });

            // 5. Agora retornamos o ID para quem chamou a função create
            console.log("Tarefa e dias salvos com sucesso! ID:", insertedId);
            return insertedId;
        } catch (error) {
            console.error("Erro ao criar tarefa:", error);
            throw error;
        }
    }

    async function getAll() {
        // Busca tarefas trazendo o nome do grupo junto (JOIN)
        return await db.getAllAsync<TaskDatabase>(`
            SELECT t.*, g.nome as grupo_nome 
            FROM tarefas t
            INNER JOIN grupos g ON t.grupo_id = g.id
            ORDER BY t.criada_em DESC
        `);
    }

    async function getDaysByTaskId(tarefaId: number) {
        const result = await db.getAllAsync<{ dia_semana: number }>(
            "SELECT dia_semana FROM tarefa_dias WHERE tarefa_id = ?",
            [tarefaId],
        );
        return result.map((row) => row.dia_semana);
    }

    async function remove(id: number) {
        try {
            // Graças ao ON DELETE CASCADE no seu schema,
            // ao deletar a tarefa, os registros em tarefa_dias somem sozinhos.
            await db.runAsync("DELETE FROM tarefas WHERE id = ?", [id]);
            console.log("Tarefa removida com sucesso");
        } catch (error) {
            console.error("Erro ao remover tarefa:", error);
            throw error;
        }
    }

    async function toggleConcluida(id: number, atualStatus: number) {
        const novoStatus = atualStatus === 0 ? 1 : 0;
        await db.runAsync("UPDATE tarefas SET concluida = ? WHERE id = ?", [
            novoStatus,
            id,
        ]);
    }

    async function getTasksByDay(diaId: number) {
        return await db.getAllAsync<{
            id: number;
            nome: string;
            descricao: string | null;
            alarme_hora: string | null;
            concluida: number;
            grupo_nome: string;
            grupo_cor: string;
        }>(
            `
        SELECT t.*, g.nome as grupo_nome, g.cor as grupo_cor
        FROM tarefas t
        INNER JOIN grupos g ON t.grupo_id = g.id
        INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
        WHERE td.dia_semana = ?
        ORDER BY t.alarme_hora ASC
    `,
            [diaId],
        );
    }

    async function getById(id: number) {
        const task = await db.getFirstAsync<TaskDatabase>(
            "SELECT * FROM tarefas WHERE id = ?",
            [id],
        );

        const days = await db.getAllAsync<{ dia_semana: number }>(
            "SELECT dia_semana FROM tarefa_dias WHERE tarefa_id = ?",
            [id],
        );

        return { ...task, dias: days.map((d) => d.dia_semana) };
    }

    // Atualiza a tarefa e limpa/reinsere os dias
    async function update(
        id: number,
        data: {
            nome: string;
            descricao: string | null;
            grupo_id: number;
            alarme_hora: string | null;
            dias: number[];
        },
    ) {
        try {
            await db.withTransactionAsync(async () => {
                // 1. Atualiza a tabela tarefas
                await db.runAsync(
                    "UPDATE tarefas SET nome = ?, descricao = ?, grupo_id = ?, alarme_hora = ? WHERE id = ?",
                    [
                        data.nome,
                        data.descricao,
                        data.grupo_id,
                        data.alarme_hora,
                        id,
                    ],
                );

                // 2. Remove os dias antigos e insere os novos (forma mais segura de atualizar N:N)
                await db.runAsync(
                    "DELETE FROM tarefa_dias WHERE tarefa_id = ?",
                    [id],
                );
                for (const dia of data.dias) {
                    await db.runAsync(
                        "INSERT INTO tarefa_dias (tarefa_id, dia_semana) VALUES (?, ?)",
                        [id, dia],
                    );
                }
            });
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
            throw error;
        }
    }

    // Dentro do useTaskDatabase
    async function cleanupTemporaryTasks() {
        try {
            // 1. Pega a hora atual no formato HH:mm
            const agora = new Date();
            const horaAtual = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;

            await db.withTransactionAsync(async () => {
                // DELETAR HOJE: Se a tarefa foi criada hoje e o grupo já acabou OU se foi criada antes de hoje
                await db.runAsync(
                    `
                DELETE FROM tarefas 
                WHERE id IN (
                    SELECT t.id FROM tarefas t
                    INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
                    INNER JOIN grupos g ON t.grupo_id = g.id
                    WHERE td.dia_semana = ? 
                    AND (date(t.criada_em) < date('now', 'localtime') 
                         OR (date(t.criada_em) = date('now', 'localtime') AND g.hora_fim < ?))
                )
            `,
                    [DAY_HOJE, horaAtual],
                );

                // DELETAR AMANHÃ: Se a tarefa foi criada há mais de 1 dia (já passou o "amanhã")
                // OU se foi criada ontem e o horário do grupo já acabou
                await db.runAsync(
                    `
                DELETE FROM tarefas 
                WHERE id IN (
                    SELECT t.id FROM tarefas t
                    INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
                    INNER JOIN grupos g ON t.grupo_id = g.id
                    WHERE td.dia_semana = ? 
                    AND (date(t.criada_em) < date('now', 'localtime', '-1 day') 
                         OR (date(t.criada_em) = date('now', 'localtime', '-1 day') AND g.hora_fim < ?))
                )
            `,
                    [DAY_AMANHA, horaAtual],
                );
            });
            console.log("Limpeza de tarefas temporárias concluída.");
        } catch (error) {
            console.error("Erro na limpeza:", error);
        }
    }

    return {
        create,
        getAll,
        getDaysByTaskId,
        remove,
        toggleConcluida,
        getTasksByDay,
        getById,
        update,
        cleanupTemporaryTasks,
    };
}
