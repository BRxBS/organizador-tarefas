import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskCardProps {
    task: {
        id: number;
        nome: string;
        descricao: string | null;
        alarme_hora: string | null;
        grupo_nome: string;
        grupo_cor: string;
    };
}

export function TaskCard({ task }: TaskCardProps) {
    const router = useRouter();
    const backgroundColor = task.grupo_cor || "#B7C4FF";

    const handleEdit = () => {
        // Navega para a tela de task passando o ID como parâmetro
        router.push({
            pathname: "/task", // Certifique-se que o caminho está correto conforme seu app/(tabs)/task
            params: { id: task.id },
        });
    };

    return (
        <View style={styles.container}>
            {/* Header da Tarefa: Grupo e Alarme */}
            <View style={styles.infoRow}>
                <View style={styles.iconLabel}>
                    <MaterialCommunityIcons
                        name="select-group"
                        size={24}
                        color="#94A3F8"
                    />
                    <Text style={styles.headerText}>
                        {task.grupo_nome.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.iconLabel}>
                    <FontAwesome6 name="bell" size={16} color="#94A3F8" />
                    <Text style={styles.headerText}>
                        {task.alarme_hora
                            ? `${task.alarme_hora} HORAS`
                            : "SEM ALARME"}
                    </Text>
                </View>
            </View>

            {/* Corpo da Tarefa */}
            <View style={[styles.cardBody, { backgroundColor }]}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEdit}
                    activeOpacity={0.6}
                >
                    <MaterialCommunityIcons
                        name="pencil-outline"
                        size={22}
                        color="#2B306E" // Cor escura para contrastar com o fundo pastel
                    />
                </TouchableOpacity>
                <Text style={styles.taskTitle}>{task.nome.toUpperCase()}</Text>
                {task.descricao && (
                    <Text style={styles.taskDesc}>{task.descricao}</Text>
                )}
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
    headerText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
    cardBody: {
        padding: 15,
        borderRadius: 15,
        position: "relative", // Necessário para o posicionamento absoluto do botão
        minHeight: 80,
        justifyContent: "center",
    },
    editButton: {
        position: "absolute",
        top: 10,
        right: 10,
        padding: 5,
    },
    taskTitle: {
        color: "#2B306E",
        fontSize: 16,
        fontWeight: "bold",
        paddingRight: 30, // Espaço para não sobrepor o ícone
    },
    taskDesc: {
        color: "#2B306E",
        fontSize: 13,
        marginTop: 5,
        opacity: 0.8,
        paddingRight: 30,
    },
});
