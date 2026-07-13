import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { DeleteTaskModal } from "@/components/DayOfTheWeek/DeleteTaskModal";
import { TaskCard } from "@/components/DayOfTheWeek/TaskCard";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { DAY_COLORS } from "@/util/colors";
import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";

type TaskWithGroup = {
    id: number;
    nome: string;
    descricao: string | null;
    alarme_hora: string | null;
    concluida: number;
    grupo_id: number;
    grupo_nome: string;
    grupo_cor: string;
    _ordem: number; // ordem efetiva pro dia sendo visualizado
};

type DayGroup = {
    grupo_id: number;
    grupo_nome: string;
    grupo_cor: string;
    tasks: TaskWithGroup[];
};

export default function DayOfTheWeekScreen() {
    const router = useRouter();
    const { id, title } = useLocalSearchParams();
    const taskDb = useTaskDatabase();
    const dayIndex = Number(id);
    const headerColor = DAY_COLORS[dayIndex] || "#A1CEDC";

    const [tasks, setTasks] = useState<TaskWithGroup[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const loadTasks = async () => {
        const data = await taskDb.getTasksByDay(dayIndex);
        setTasks(data);
    };

    useEffect(() => {
        loadTasks();
    }, [id]);

    const openDeleteModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setModalVisible(true);
    };

    const handleDeleteDay = async () => {
        if (selectedTaskId) {
            await taskDb.removeSpecificDay(selectedTaskId, dayIndex);
            setModalVisible(false);
            loadTasks();
        }
    };

    const handleDeleteAll = async () => {
        if (selectedTaskId) {
            await taskDb.remove(selectedTaskId);
            setModalVisible(false);
            loadTasks();
        }
    };

    // Agrupa mantendo a ordem que já vem ordenada do banco (por _ordem)
    const dayGroups = useMemo<DayGroup[]>(() => {
        const map = new Map<number, DayGroup>();
        for (const task of tasks) {
            if (!map.has(task.grupo_id)) {
                map.set(task.grupo_id, {
                    grupo_id: task.grupo_id,
                    grupo_nome: task.grupo_nome,
                    grupo_cor: task.grupo_cor,
                    tasks: [],
                });
            }
            map.get(task.grupo_id)!.tasks.push(task);
        }
        return Array.from(map.values());
    }, [tasks]);

    const handleDragEnd = (groupId: number, newGroupTasks: TaskWithGroup[]) => {
        // Atualiza state local só do grupo que mudou, preservando os demais
        setTasks((prev) => {
            const others = prev.filter((t) => t.grupo_id !== groupId);
            return [...others, ...newGroupTasks];
        });

        const formatted = newGroupTasks.map((item, index) => ({
            id: item.id,
            ordem: index,
        }));

        Alert.alert(
            "Reordenar tarefas",
            "Você quer aplicar essa nova ordem só para este dia ou para todos os dias em que essa tarefa aparece?",
            [
                {
                    text: "Somente este dia",
                    onPress: () => saveOrder(formatted, "dia"),
                },
                {
                    text: "Todos os dias",
                    onPress: () => saveOrder(formatted, "todos"),
                },
                {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => loadTasks(),
                },
            ],
        );
    };

    const saveOrder = async (
        formatted: { id: number; ordem: number }[],
        escopo: "dia" | "todos",
    ) => {
        try {
            if (escopo === "dia") {
                await taskDb.updateTaskOrderForDay(dayIndex, formatted);
            } else {
                await taskDb.updateTaskOrder(formatted);
            }
        } catch (error: any) {
            Alert.alert(
                "Erro",
                "Não foi possível salvar a nova ordem: " + error.message,
            );
            loadTasks();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ParallaxScrollView
                headerBackgroundColor={{
                    light: DAY_COLORS[Number(id)],
                    dark: DAY_COLORS[Number(id)],
                }}
                title={title as string}
            >
                {dayGroups.length === 0 && (
                    <Text style={styles.emptyText}>
                        Nenhuma tarefa para este dia.
                    </Text>
                )}

                {dayGroups.map((group) => (
                    <View key={group.grupo_id} style={styles.groupSection}>
                        {/* <View style={styles.groupHeader}>
                            <Text style={styles.groupName}>
                                {group.grupo_nome.toUpperCase()}
                            </Text>
                        </View> */}

                        <View
                            style={[
                                styles.tasksContainer,
                                { borderColor: group.grupo_cor },
                            ]}
                        >
                            <DraggableFlatList<TaskWithGroup>
                                data={group.tasks}
                                keyExtractor={(item) => item.id.toString()}
                                onDragEnd={({ data }) =>
                                    handleDragEnd(group.grupo_id, data)
                                }
                                scrollEnabled={false}
                                activationDistance={20}
                                renderItem={({ item, drag, isActive }) => (
                                    <ScaleDecorator>
                                        <TouchableOpacity
                                            onLongPress={drag}
                                            disabled={isActive}
                                            activeOpacity={1}
                                            style={{
                                                opacity: isActive ? 0.7 : 1,
                                            }}
                                        >
                                            <TaskCard
                                                task={item}
                                                onEdit={(id) =>
                                                    router.push({
                                                        pathname: "/task",
                                                        params: { id },
                                                    })
                                                }
                                                onDelete={openDeleteModal}
                                            />
                                        </TouchableOpacity>
                                    </ScaleDecorator>
                                )}
                            />
                        </View>
                    </View>
                ))}

                {/* <View style={styles.listContainer}>
                    <DraggableFlatList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        onDragEnd={({ data }) => handleDragEnd(data)}
                        scrollEnabled={false}
                        activationDistance={20}
                        renderItem={({ item, drag, isActive }) => (
                            <ScaleDecorator>
                                <TouchableOpacity
                                    onLongPress={drag}
                                    disabled={isActive}
                                    activeOpacity={1}
                                    style={{ opacity: isActive ? 0.7 : 1 }}
                                >
                                    <TaskCard
                                        task={item}
                                        onEdit={(id) =>
                                            router.push({
                                                pathname: "/task",
                                                params: { id },
                                            })
                                        }
                                        onDelete={openDeleteModal}
                                    />
                                </TouchableOpacity>
                            </ScaleDecorator>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Nenhuma tarefa para este dia.
                            </Text>
                        }
                    />
                </View> */}
            </ParallaxScrollView>

            <DeleteTaskModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onDeleteDay={handleDeleteDay}
                onDeleteAll={handleDeleteAll}
            />

            {/* Botão Flutuante (FAB) */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: headerColor }]}
                onPress={() => router.push("/(tabs)/task")}
            >
                <FontAwesome6 name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    groupSection: { marginBottom: 20, paddingHorizontal: 0 },
    groupHeader: { marginBottom: 8 },
    groupName: { fontSize: 14, fontWeight: "700", color: "#8A9AFA" },
    tasksContainer: {
        borderRadius: 15,
        borderWidth: 1,
        overflow: "hidden",
        padding: 10,
    },
    listContainer: { padding: 20 },
    emptyText: {
        color: "#999",
        textAlign: "center",
        marginTop: 50,
        fontWeight: "bold",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
