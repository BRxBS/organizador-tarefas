import TaskItem from "@/components/TaskItem";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
// Importe seus hooks e componentes de modal aqui

export default function AllTasksScreen() {
    const taskDb = useTaskDatabase();
    const [allTasks, setAllTasks] = useState<any[]>([]);

    const loadData = async () => {
        const data = await taskDb.getAllTasksWithGroups();
        setAllTasks(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Agrupa as tarefas por Grupo
    const groupedData = useMemo(() => {
        const groups: any = {};
        allTasks.forEach((task) => {
            if (!groups[task.grupo_id]) {
                groups[task.grupo_id] = {
                    nome: task.grupo_nome,
                    cor: task.grupo_cor,
                    horario: `${task.hora_inicio} ATÉ ${task.hora_fim}`,
                    tasks: [],
                };
            }
            groups[task.grupo_id].tasks.push(task);
        });
        return Object.values(groups);
    }, [allTasks]);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>TAREFAS</Text>
            </View>

            <ScrollView style={styles.content}>
                {groupedData.map((group: any, idx) => (
                    <View key={idx} style={styles.groupSection}>
                        {/* Header do Grupo */}
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

                        {/* Container das Tarefas do Grupo */}
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
                            <ScrollView
                                nestedScrollEnabled
                                style={styles.groupScroll}
                                contentContainerStyle={{ paddingVertical: 10 }}
                            >
                                {group.tasks.map((task: any) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onRefresh={loadData}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    },
    sideBar: { width: 20, height: "100%" },
    groupScroll: { flex: 1, paddingHorizontal: 15 },
});
