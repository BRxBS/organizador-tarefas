import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DaySelectorProps {
    selectedIds: number[];
    onSelectType: (type: "temp" | "routine") => void;
}

export function DaySelector({ selectedIds, onSelectType }: DaySelectorProps) {
    const isTemporary = selectedIds.some((id) => id < 0);
    const isRoutine = selectedIds.some((id) => id >= 0);
    const hasSelection = selectedIds.length > 0;

    const getLabel = () => {
        if (!hasSelection) return "Nenhum dia selecionado";
        if (selectedIds.includes(-1)) return "HOJE";
        if (selectedIds.includes(-2)) return "AMANHÃ";

        // Lógica para Rotina (mesma que você já tinha)
        if (selectedIds.length === 7) return "TODOS OS DIAS";
        const workDays = [1, 2, 3, 4, 5];
        if (
            selectedIds.length === 5 &&
            workDays.every((d) => selectedIds.includes(d))
        )
            return "DIAS ÚTEIS";

        return "Dias selecionados"; // Ou mapear os nomes como você fez antes
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>DIA DA TAREFA*</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        isTemporary && styles.activeButton,
                    ]}
                    onPress={() => onSelectType("temp")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            isTemporary && styles.activeText,
                        ]}
                    >
                        TEMPORÁRIO
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        isRoutine && styles.activeButton,
                    ]}
                    onPress={() => onSelectType("routine")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            isRoutine && styles.activeText,
                        ]}
                    >
                        ROTINA
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.displayBox}>
                <Text style={styles.displayText}>{getLabel()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { color: "#FFF", fontSize: 14, fontWeight: "bold", marginBottom: 8 },
    buttonRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    typeButton: {
        flex: 1,
        height: 45,
        backgroundColor: "#4A55A2", // Cor desativada
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    activeButton: {
        backgroundColor: "#B7C4FF", // Cor ativada
    },
    typeText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
    activeText: { color: "#333" },
    displayBox: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#B7C4FF",
    },
    displayText: { color: "#B7C4FF", fontSize: 13, fontWeight: "500" },
});
