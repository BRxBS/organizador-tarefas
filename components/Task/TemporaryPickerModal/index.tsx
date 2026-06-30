import { COLOR_AMANHA, COLOR_HOJE } from "@/util/colors";
import { DAY_AMANHA, DAY_HOJE } from "@/util/days";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TemporaryPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (selectedIds: number[]) => void; // <--- Mudou de onConfirm para onSelect
    initialSelection: number[];
}

export default function TemporaryPickerModal({
    visible,
    onClose,
    onSelect,
    initialSelection,
}: TemporaryPickerModalProps) {
    // Filtra apenas IDs temporários para o estado interno
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            const tempOnly = initialSelection.filter((id) => id < 0);
            setSelected(tempOnly);
        }
    }, [visible, initialSelection]);

    const handleSelect = (id: number) => {
        // Seleção única: se clicar no que já está selecionado, desmarca.
        // Se clicar no outro, troca.
        if (selected.includes(id)) {
            setSelected([]);
        } else {
            setSelected([id]);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>TAREFA TEMPORÁRIA</Text>
                    <Text style={styles.subtitle}>Selecione um dia único</Text>
                    <View style={styles.divider} />

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={styles.dayRow}
                            onPress={() => handleSelect(DAY_HOJE)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    selected.includes(DAY_HOJE) &&
                                        styles.checkboxSelected,
                                ]}
                            />
                            <View
                                style={[
                                    styles.dayButton,
                                    { backgroundColor: COLOR_HOJE },
                                ]}
                            >
                                <Text style={styles.dayText}>HOJE</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dayRow}
                            onPress={() => handleSelect(DAY_AMANHA)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    selected.includes(DAY_AMANHA) &&
                                        styles.checkboxSelected,
                                ]}
                            />
                            <View
                                style={[
                                    styles.dayButton,
                                    { backgroundColor: COLOR_AMANHA },
                                ]}
                            >
                                <Text style={styles.dayText}>AMANHÃ</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelBtnText}>CANCELAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                selected.length === 0 && styles.btnDisabled,
                            ]}
                            onPress={() => onSelect(selected)}
                            disabled={selected.length === 0}
                        >
                            <Text style={styles.saveBtnText}>CONFIRMAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#E6E8FA",
        width: "85%",
        borderRadius: 20,
        padding: 20,
    },
    title: {
        textAlign: "center",
        fontWeight: "bold",
        color: "#4A55A2",
        fontSize: 16,
    },
    subtitle: {
        textAlign: "center",
        color: "#888",
        fontSize: 12,
        marginBottom: 10,
    },
    divider: { height: 1, backgroundColor: "#CCC", marginBottom: 20 },
    optionsContainer: { gap: 15 },
    dayRow: { flexDirection: "row", alignItems: "center", gap: 15 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#8A9AFA",
    },
    checkboxSelected: { backgroundColor: "#4A55A2", borderColor: "#4A55A2" },
    dayButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center" },
    dayText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    footer: { marginTop: 30, flexDirection: "row", gap: 10 },
    saveBtn: {
        flex: 2,
        backgroundColor: "#4FB0D1",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#F25555",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    btnDisabled: { opacity: 0.5 },
    saveBtnText: { color: "#FFF", fontWeight: "bold" },
    cancelBtnText: { color: "#FFF", fontWeight: "bold" },
});
