import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskCardProps {
    task: any;
    onEdit: (id: number) => void; // Adicionado aqui
    onDelete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    const backgroundColor = task.grupo_cor || "#B7C4FF";

    return (
        <View style={styles.container}>
            <View style={styles.infoRow}>
                <View style={styles.iconLabel}>
                    <MaterialCommunityIcons
                        name="select-group"
                        size={20}
                        color="#94A3F8"
                    />
                    <Text style={styles.headerText}>
                        {task.grupo_nome.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.iconLabel}>
                    <FontAwesome6 name="bell" size={14} color="#94A3F8" />
                    <Text style={styles.headerText}>
                        {task.alarme_hora
                            ? `${task.alarme_hora}H`
                            : "SEM ALARME"}
                    </Text>
                </View>
            </View>

            <View style={[styles.cardBody, { backgroundColor }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>
                        {task.nome.toUpperCase()}
                    </Text>
                    {task.descricao && (
                        <Text style={styles.taskDesc}>{task.descricao}</Text>
                    )}
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEdit(task.id)} // Agora usa a função passada por prop
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={24}
                            color="#2B306E"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onDelete(task.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={24}
                            color="#C62828"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5,
        marginBottom: 5,
    },
    iconLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerText: { color: "#94A3F8", fontSize: 14, fontWeight: "bold" },
    cardBody: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingLeft: 15,
        paddingRight: 5,
        borderRadius: 12,
    },
    taskTitle: {
        color: "#2B306E",
        fontSize: 16,
        fontWeight: "bold",
    },
    taskDesc: {
        color: "#2B306E",
        fontSize: 13,
        marginTop: 2,
        opacity: 0.8,
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        padding: 10,
        marginLeft: 2,
    },
});
