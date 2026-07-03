import { DAY_AMANHA, DAY_HOJE } from "@/util/days";
import { updateWidget } from "@/util/updateWidget";
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
            updateWidget();
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
            updateWidget();
            console.log("Tarefa removida com sucesso");
        } catch (error) {
            console.error("Erro ao remover tarefa:", error);
            throw error;
        }
    }

    async function removeSpecificDay(tarefaId: number, diaSemana: number) {
        try {
            await db.runAsync(
                "DELETE FROM tarefa_dias WHERE tarefa_id = ? AND dia_semana = ?",
                [tarefaId, diaSemana],
            );

            // Opcional: Se a tarefa não tiver mais nenhum dia vinculado, você pode excluí-la totalmente
            const remainingDays = await db.getAllAsync(
                "SELECT * FROM tarefa_dias WHERE tarefa_id = ?",
                [tarefaId],
            );
            if (remainingDays.length === 0) {
                await remove(tarefaId); // Chama sua função já existente de remover a tarefa toda
            }
            updateWidget();
        } catch (error) {
            console.error("Erro ao remover dia da tarefa:", error);
            throw error;
        }
    }

    async function getTasksByDay(diaId: number) {
        // 1. Descobrir qual o índice real do dia da semana hoje e amanhã
        const hojeReal = new Date().getDay(); // 0 a 6
        const amanhaReal = (hojeReal + 1) % 7;

        // 2. Criar uma lista de IDs para buscar
        // Sempre buscamos o ID do dia (0-6)
        const idsParaBuscar = [diaId];

        // Se o dia que a tela quer carregar for o dia de HOJE real,
        // incluímos também o marcador de tarefa temporária de hoje
        if (diaId === hojeReal) {
            idsParaBuscar.push(DAY_HOJE); // Geralmente -1
        }

        // Se o dia que a tela quer carregar for o dia de AMANHÃ real,
        // incluímos também o marcador de tarefa temporária de amanhã
        if (diaId === amanhaReal) {
            idsParaBuscar.push(DAY_AMANHA); // Geralmente -2
        }

        // 3. Criar os placeholders (?, ?, ?) para o IN do SQL
        const placeholders = idsParaBuscar.map(() => "?").join(",");

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
        SELECT DISTINCT t.*, g.nome as grupo_nome, g.cor as grupo_cor
        FROM tarefas t
        INNER JOIN grupos g ON t.grupo_id = g.id
        INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
        WHERE td.dia_semana IN (${placeholders})
        ORDER BY t.alarme_hora ASC
        `,
            idsParaBuscar,
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
            updateWidget();
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
            throw error;
        }
    }

    // Dentro do useTaskDatabase
    async function cleanupTemporaryTasks() {
        try {
            // 1. Pega a hora atual no formato HH:mm (ex: "14:30")
            const agora = new Date();
            const horaAtual = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;

            // Definir os valores caso não venham de fora (ajuste conforme suas constantes)
            const DH = -1; // DAY_HOJE
            const DA = -2; // DAY_AMANHA

            console.log("Iniciando limpeza. Hora atual:", horaAtual);

            // Limpeza HOJE:
            // Remove se a tarefa é de "hoje" e (foi criada em dias anteriores OU (criada hoje mas o grupo já acabou))
            await db.runAsync(
                `DELETE FROM tarefas 
             WHERE id IN (
                SELECT t.id FROM tarefas t
                INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
                INNER JOIN grupos g ON t.grupo_id = g.id
                WHERE td.dia_semana = ? 
                AND (
                    date(t.criada_em) < date('now', 'localtime') 
                    OR (date(t.criada_em) = date('now', 'localtime') AND g.hora_fim < ?)
                )
             )`,
                [DH, horaAtual],
            );

            // Limpeza AMANHÃ:
            // Remove se a tarefa é de "amanhã" e (foi criada há mais de 1 dia atrás OU (criada ontem mas o grupo já acabou))
            await db.runAsync(
                `DELETE FROM tarefas 
             WHERE id IN (
                SELECT t.id FROM tarefas t
                INNER JOIN tarefa_dias td ON t.id = td.tarefa_id
                INNER JOIN grupos g ON t.grupo_id = g.id
                WHERE td.dia_semana = ? 
                AND (
                    date(t.criada_em) < date('now', 'localtime', '-1 day') 
                    OR (date(t.criada_em) = date('now', 'localtime', '-1 day') AND g.hora_fim < ?)
                )
             )`,
                [DA, horaAtual],
            );
            updateWidget();
            console.log("Limpeza concluída com sucesso.");
        } catch (error) {
            // Agora o erro será capturado aqui sem o crash de "cannot rollback"
            console.error("Erro detalhado na limpeza:", error);
        }
    }

    async function getAllTasksWithGroups() {
        // Busca todas as tarefas, grupos e também os dias vinculados
        const tasks = await db.getAllAsync<any>(`
        SELECT t.*, g.nome as grupo_nome, g.cor as grupo_cor, g.hora_inicio, g.hora_fim
        FROM tarefas t
        INNER JOIN grupos g ON t.grupo_id = g.id
        ORDER BY g.hora_inicio ASC, t.alarme_hora ASC
    `);

        // Para cada tarefa, busca os dias dela para montar o texto de "frequência"
        const results = await Promise.all(
            tasks.map(async (task) => {
                const days = await getDaysByTaskId(task.id);
                return { ...task, dias: days };
            }),
        );

        return results;
    }

    async function updateGroupOrder(
        orderedGroups: { id: number; ordem: number }[],
    ) {
        for (const group of orderedGroups) {
            await db.runAsync("UPDATE grupos SET ordem = ? WHERE id = ?", [
                group.ordem,
                group.id,
            ]);
        }
    }

    return {
        create,
        getAll,
        getDaysByTaskId,
        remove,
        removeSpecificDay,
        getTasksByDay,
        getById,
        update,
        cleanupTemporaryTasks,
        getAllTasksWithGroups,
        updateGroupOrder,
    };
}
