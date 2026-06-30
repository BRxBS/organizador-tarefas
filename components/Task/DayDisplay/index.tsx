import { DAY_AMANHA, DAY_HOJE, DAYS_DATA } from "@/util/days";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DayDisplayProps {
    selectedIds: number[];
}

export function DayDisplay({ selectedIds }: DayDisplayProps) {
    const getLabel = () => {
        if (selectedIds.length === 0) return "Toque para escolher os dias";
        if (selectedIds.includes(DAY_HOJE)) return "HOJE";
        if (selectedIds.includes(DAY_AMANHA)) return "AMANHÃ";
        if (selectedIds.length === 7) return "TODOS OS DIAS";

        const workDays = [1, 2, 3, 4, 5];
        const isWorkDays =
            selectedIds.length === 5 &&
            workDays.every((d) => selectedIds.includes(d));
        if (isWorkDays) return "DIAS ÚTEIS";

        // Ordenar os dias de 0 a 6 antes de exibir
        return selectedIds
            .sort((a, b) => a - b)
            .map((id) =>
                DAYS_DATA.find((d) => Number(d.id) === id)?.title.substring(
                    0,
                    3,
                ),
            )
            .join(", ");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>DIA DA TAREFA</Text>
            <View style={styles.displayBox}>
                <Text style={styles.displayText}>{getLabel()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { color: "#FFF", fontSize: 14, fontWeight: "bold", marginBottom: 8 },
    displayBox: {
        backgroundColor: "#B7C4FF",
        borderRadius: 10,
        padding: 15,
        minHeight: 55,
        justifyContent: "center",
    },
    displayText: { color: "#333", fontSize: 14, fontWeight: "500" },
});
