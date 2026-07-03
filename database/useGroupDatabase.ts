import { useSQLiteContext } from "expo-sqlite";

export function useGroupDatabase() {
    const db = useSQLiteContext();

    async function create(data: {
        nome: string;
        hora_inicio: string;
        hora_fim: string;
        cor: string;
    }) {
        // Usamos os nomes exatos das colunas da sua tabela
        const statement = await db.prepareAsync(
            "INSERT INTO grupos (nome, hora_inicio, hora_fim, cor) VALUES ($nome, $hora_inicio, $hora_fim, $cor)",
        );
        try {
            await statement.executeAsync({
                $nome: data.nome,
                $hora_inicio: data.hora_inicio,
                $hora_fim: data.hora_fim,
                $cor: data.cor,
            });
            console.log("Grupo salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao inserir no banco:", error);
            throw error;
        } finally {
            await statement.finalizeAsync();
        }
    }

    async function getAll() {
        return await db.getAllAsync<{
            id: number;
            nome: string;
            hora_inicio: string;
            hora_fim: string;
            cor: string;
        }>("SELECT * FROM grupos");
    }

    async function update(
        id: number,
        data: {
            nome: string;
            hora_inicio: string;
            hora_fim: string;
            cor: string;
        },
    ) {
        await db.runAsync(
            "UPDATE grupos SET nome = ?, hora_inicio = ?, hora_fim = ?, cor = ? WHERE id = ?",
            [data.nome, data.hora_inicio, data.hora_fim, data.cor, id], // O ID deve ser o ÚLTIMO aqui
        );
    }

    async function remove(id: number) {
        try {
            // Importante: use o id dentro de um array []
            await db.runAsync("DELETE FROM grupos WHERE id = ?", [id]);
            console.log("Grupo removido do banco, ID:", id);
        } catch (error) {
            console.error("Erro ao remover no banco:", error);
            throw error;
        }
    }

    async function countTasksByGroup(groupId: number) {
        const result = await db.getFirstAsync<{ total: number }>(
            "SELECT COUNT(*) as total FROM tarefas WHERE grupo_id = ?",
            [groupId],
        );
        return result?.total || 0;
    }

    return { create, getAll, update, remove, countTasksByGroup };
}
