import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
    NestableScrollContainer,
    ScaleDecorator,
} from "react-native-draggable-flatlist";

import TaskItem from "@/components/TaskItem";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TaskWithGroup = {
    id: number;
    nome: string;
    descricao: string | null;
    grupo_id: number;
    alarme_hora: string | null;
    concluida: number;
    grupo_nome: string;
    grupo_cor: string;
    hora_inicio: string;
    hora_fim: string;
    ordem: number;
    dias: number[];
};

type TaskGroup = {
    grupo_id: number;
    nome: string;
    cor: string;
    horario: string;
    tasks: TaskWithGroup[];
};

export default function AllTasksScreen() {
    const taskDb = useTaskDatabase();
    const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);

    const loadData = async () => {
        const data = await taskDb.getAllTasksWithGroups();

        // Mesma lógica de agrupamento que você já tinha no useMemo,
        // só que agora alimenta um state (pra podermos reordenar)
        const groups: Record<number, TaskGroup> = {};
        data.forEach((task: TaskWithGroup) => {
            if (!groups[task.grupo_id]) {
                groups[task.grupo_id] = {
                    grupo_id: task.grupo_id,
                    nome: task.grupo_nome,
                    cor: task.grupo_cor,
                    horario: `${task.hora_inicio} ATÉ ${task.hora_fim}`,
                    tasks: [],
                };
            }
            groups[task.grupo_id].tasks.push(task);
        });

        setTaskGroups(Object.values(groups));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDragEnd = async (
        groupId: number,
        newTasks: TaskWithGroup[],
    ) => {
        // Atualiza state local só do grupo que mudou (mantém os outros grupos intactos)
        setTaskGroups((prev) =>
            prev.map((g) =>
                g.grupo_id === groupId ? { ...g, tasks: newTasks } : g,
            ),
        );

        const formatted = newTasks.map((item, index) => ({
            id: item.id,
            ordem: index,
        }));

        try {
            await taskDb.updateTaskOrder(formatted); // ordem global, todos os dias
        } catch (error: any) {
            Alert.alert(
                "Erro",
                "Não foi possível salvar a nova ordem: " + error.message,
            );
            loadData(); // reverte pra ordem persistida em caso de erro
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>TAREFAS</Text>
            </View>

            <NestableScrollContainer
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {taskGroups.map((group) => (
                    <View key={group.grupo_id} style={styles.groupSection}>
                        <View style={styles.groupHeader}>
                            <View style={styles.groupHeaderLeft}>
                                <MaterialCommunityIcons
                                    name="select-group"
                                    size={24}
                                    color="#8A9AFA"
                                />
                                <Text style={styles.groupName}>
                                    {group.nome.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.groupTime}>
                                {group.horario}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.tasksContainer,
                                { borderColor: group.cor },
                            ]}
                        >
                            <View
                                style={[
                                    styles.sideBar,
                                    { backgroundColor: group.cor },
                                ]}
                            />

                            <DraggableFlatList<TaskWithGroup>
                                data={group.tasks}
                                keyExtractor={(item) => item.id.toString()}
                                onDragEnd={({ data }) =>
                                    handleDragEnd(group.grupo_id, data)
                                }
                                activationDistance={20}
                                style={{ flex: 1, width: "150%" }}
                                contentContainerStyle={{
                                    padding: 15, // Espaço interno para os cards não encostarem na borda
                                }}
                                // Isso cria o espaçamento entre os cards azuis
                                ItemSeparatorComponent={() => (
                                    <View style={{ height: 12 }} />
                                )}
                                renderItem={({ item, drag, isActive }) => (
                                    <ScaleDecorator>
                                        <TouchableOpacity
                                            onLongPress={drag}
                                            disabled={isActive}
                                            activeOpacity={0.9}
                                            style={{
                                                width: "100%",
                                                opacity: isActive ? 0.7 : 1,
                                            }}
                                        >
                                            <TaskItem
                                                task={item}
                                                onRefresh={loadData}
                                            />
                                        </TouchableOpacity>
                                    </ScaleDecorator>
                                )}
                            />
                        </View>
                    </View>
                ))}
            </NestableScrollContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: "#1E1E1E" },
    header: {
        height: 120,
        backgroundColor: "#8A9AFA",
        justifyContent: "flex-end",
        padding: 20,
    },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
    content: { flex: 1, padding: 15, marginTop: 10 },
    groupSection: { marginBottom: 30 },
    groupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    groupHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    groupName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    groupTime: { color: "#AAA", fontSize: 12, marginRight: 5 },
    tasksContainer: {
        flexDirection: "row",
        backgroundColor: "#2A2A2A",
        borderRadius: 15,
        height: 250, // Altura para caber aprox 3 tarefas e permitir scroll
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#444",
        width: "100%",
    },
    sideBar: { width: 20, height: "100%" },
    groupScroll: { flex: 1, paddingHorizontal: 15 },
});
