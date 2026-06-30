import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useGroupDatabase } from "@/database/useGroupDatabase";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import GroupForm from "../../components/Groups/GroupForm";
import GroupList from "../../components/Groups/GroupList";

export default function GroupsScreen() {
    const groupDb = useGroupDatabase();

    const [groups, setGroups] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [color, setColor] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);

    const loadGroups = async () => {
        try {
            const result = await groupDb.getAll();
            setGroups(result);
        } catch (error) {
            console.error("Erro ao carregar grupos:", error);
        }
    };
    useEffect(() => {
        loadGroups();
    }, []);

    const resetForm = () => {
        setName("");
        setStart("");
        setEnd("");
        setColor("");
        setEditingId(null);
    };

    const handleEdit = (group: any) => {
        setName(group.nome);
        setStart(group.hora_inicio);
        setEnd(group.hora_fim);
        setColor(group.cor);
        setEditingId(group.id);
    };

    const handleDelete = (id: any) => {
        // Log para testar se o ID está chegando
        console.log("Solicitada exclusão do ID:", id);

        Alert.alert("Excluir", "Deseja realmente remover este grupo?", [
            { text: "Não", style: "cancel" },
            {
                text: "Sim",
                onPress: async () => {
                    try {
                        await groupDb.remove(id); // Chama o banco
                        await loadGroups(); // Recarrega a lista na tela
                        Alert.alert("Sucesso", "Grupo removido.");
                    } catch (error) {
                        Alert.alert(
                            "Erro",
                            "Não foi possível excluir. Verifique se existem tarefas ligadas a este grupo.",
                        );
                    }
                },
            },
        ]);
    };

    const handleSave = async () => {
        if (!name.trim() || !start || !end || !color) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        try {
            if (editingId) {
                // Aqui o TS não vai mais reclamar pois editingId é number
                await groupDb.update(editingId, {
                    nome: name,
                    hora_inicio: start,
                    hora_fim: end,
                    cor: color,
                });
            } else {
                await groupDb.create({
                    nome: name,
                    hora_inicio: start,
                    hora_fim: end,
                    cor: color,
                });
            }

            resetForm();
            await loadGroups(); // Agora a função existe e vai atualizar a lista na tela
            Alert.alert("Sucesso", "Grupo salvo!");
        } catch (error) {
            console.error("Falha ao salvar no banco:", error);
            Alert.alert("Erro", "Não foi possível salvar no banco de dados.");
        }
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#2B306E", dark: "#2B306E" }}
            title="GERENCIAR GRUPOS"
            headerHeight={150}
        >
            <View style={styles.mainContainer}>
                <GroupList
                    home={false}
                    groups={groups}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <GroupForm
                    name={name}
                    setName={setName}
                    start={start}
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                    color={color}
                    setColor={setColor}
                    onSave={handleSave}
                    onCancel={resetForm}
                    isEditing={!!editingId}
                />
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, // Ocupa todo o espaço que o ParallaxScrollView liberar
        justifyContent: "space-between", // Empurra o Form para o final se sobrar espaço
        paddingBottom: 20, // Espaço extra para não colar na barra inferior
    },
});
