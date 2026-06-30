import React from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface GroupPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (id: number, nome: string) => void;
    groups: any[];
}

export default function GroupPickerModal({
    visible,
    onClose,
    onSelect,
    groups,
}: GroupPickerModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>GRUPOS DISPONÍVEIS</Text>
                    <View style={styles.divider} />

                    <FlatList
                        data={groups} // <--- Usa os grupos que vieram via Props
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                Nenhum grupo disponível para este horário
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.groupItem,
                                    { backgroundColor: item.cor },
                                ]}
                                onPress={() => onSelect(item.id, item.nome)}
                            >
                                <Text style={styles.groupText}>
                                    {item.nome.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
    },
    modalContent: {
        backgroundColor: "#D2DDFE",
        marginHorizontal: 30,
        borderRadius: 20,
        padding: 20,
        maxHeight: "60%",
    },
    title: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
        color: "#555",
        marginBottom: 10,
    },
    divider: { height: 1, backgroundColor: "#DDD", marginBottom: 15 },
    groupItem: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    groupText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    empty: { textAlign: "center", color: "#999", marginVertical: 20 },
    closeBtn: { marginTop: 10, padding: 12, alignItems: "center" },
    closeBtnText: { color: "#F25555", fontWeight: "bold" },
});
