import { useTaskDatabase } from "@/database/useTaskDatabase";
import { getFrequencyText } from "@/util/days";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TaskItem({
    task,
    onRefresh,
}: {
    task: any;
    onRefresh: () => void;
}) {
    const router = useRouter();
    const taskDb = useTaskDatabase();

    const handleDelete = () => {
        Alert.alert("Excluir", "Deseja excluir esta tarefa de todos os dias?", [
            { text: "Não", style: "cancel" },
            {
                text: "Sim",
                onPress: async () => {
                    await taskDb.remove(task.id);
                    onRefresh();
                },
            },
        ]);
    };

    return (
        <View
            style={[
                styles.taskCard,
                { backgroundColor: task.grupo_cor || "#4E5DB2" },
            ]}
        >
            {/* LINHA SUPERIOR: Nome e Alarme */}
            <View style={styles.cardRow}>
                <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.nome.toUpperCase()}
                </Text>

                <View style={styles.rightHeader}>
                    <Text
                        style={[
                            styles.timeText,
                            { fontSize: task.alarme_hora ? 16 : 14 },
                        ]}
                    >
                        {task.alarme_hora
                            ? task.alarme_hora.toUpperCase()
                            : "Sem alarme"}
                    </Text>
                    {task.alarme_hora && (
                        <View style={styles.alarmCircle}>
                            <MaterialCommunityIcons
                                name="bell"
                                size={18}
                                color="#fff"
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* LINHA INFERIOR: Frequência e Ações */}
            <View style={[styles.cardRow, { marginTop: 15 }]}>
                <Text style={styles.taskFreq}>
                    {getFrequencyText(task.dias).toUpperCase()}
                </Text>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/task",
                                params: { id: task.id },
                            })
                        }
                        style={styles.iconBtn}
                    >
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={26}
                            color="#FFF"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDelete}
                        style={styles.iconBtn}
                    >
                        <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={26}
                            color="#FFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    taskCard: {
        borderRadius: 15,
        padding: 10,
        paddingHorizontal: 15,
        marginBottom: 12,
        // Sombras para dar profundidade
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        width: "100%",
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        flex: 1, // Permite que o título ocupe o espaço necessário
    },
    rightHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    timeText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "500",
    },
    alarmCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255, 255, 255, 0.4)", // Círculo translúcido como no mockup
        justifyContent: "center",
        alignItems: "center",
    },
    taskFreq: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
        opacity: 0.9,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
    },
    iconBtn: {
        padding: 4, // Aumenta área de toque
    },
});
