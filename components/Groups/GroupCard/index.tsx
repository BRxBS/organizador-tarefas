import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GroupCard({ group, onEdit, onDelete }: any) {
    return (
        <View
            style={[styles.card, { borderLeftColor: group.cor || "#4A90E2" }]}
        >
            <View style={styles.info}>
                <Text style={styles.name}>{group.nome || "Sem nome"}</Text>
                <Text style={styles.time}>
                    {group.hora_inicio} até {group.hora_fim}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => onEdit(group)}
                    style={styles.btn}
                >
                    <Ionicons name="pencil" size={20} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onDelete(group.id)}
                    style={styles.btn}
                >
                    <Ionicons name="trash" size={20} color="#E59A9A" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        marginBottom: 8,
        borderLeftWidth: 10,
        width: "100%", // Força a largura total
    },
    info: { flex: 1 },
    name: {
        color: "#FFFFFF", // Cor branca explícita
        fontWeight: "bold",
        fontSize: 15,
    },
    time: {
        color: "#CCCCCC", // Cinza claro explícito
        fontSize: 12,
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    btn: {
        padding: 5,
        marginLeft: 10,
    },
});
