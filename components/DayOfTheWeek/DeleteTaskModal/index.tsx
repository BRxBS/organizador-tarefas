import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DeleteModalProps {
    visible: boolean;
    onClose: () => void;
    onDeleteDay: () => void;
    onDeleteAll: () => void;
}

export function DeleteTaskModal({
    visible,
    onClose,
    onDeleteDay,
    onDeleteAll,
}: DeleteModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={40}
                            color="#C62828"
                        />
                    </View>

                    <Text style={styles.title}>EXCLUIR TAREFA</Text>
                    <Text style={styles.subtitle}>
                        Como você deseja remover esta tarefa?
                    </Text>

                    <TouchableOpacity
                        style={styles.btnOption}
                        onPress={onDeleteDay}
                    >
                        <Text style={styles.btnText}>
                            REMOVER APENAS DE HOJE
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnOption, styles.btnAll]}
                        onPress={onDeleteAll}
                    >
                        <Text style={[styles.btnText, { color: "#FFF" }]}>
                            REMOVER DE TODOS OS DIAS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.btnCancel}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFF",
        width: "100%",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        elevation: 10,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#FFEBEE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2B306E",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 25,
    },
    btnOption: {
        width: "100%",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        alignItems: "center",
        marginBottom: 12,
    },
    btnAll: {
        backgroundColor: "#C62828",
        borderColor: "#C62828",
    },
    btnText: { fontWeight: "bold", color: "#2B306E" },
    btnCancel: { marginTop: 10, padding: 10 },
    cancelText: { color: "#999", fontWeight: "bold" },
});
