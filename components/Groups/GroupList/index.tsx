import ExistingGroups from "@/components/Home/ExistingGroups";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import GroupCard from "../GroupCard";

interface GroupListProps {
    groups: any[];
    home: boolean;
    onEdit?: (group: any) => void;
    onDelete?: (id: string) => void;
    onDragEnd?: (data: any[]) => void;
}

const GroupList = ({
    groups,
    home,
    onEdit,
    onDelete,
    onDragEnd,
}: GroupListProps) => {
    // Se não houver grupos
    if (groups.length === 0) {
        return (
            <View style={styles.container}>
                {!home && (
                    <Text style={styles.sectionTitle}>GRUPOS CADASTRADOS</Text>
                )}
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        NENHUM GRUPO REGISTRADO ATÉ O MOMENTO
                    </Text>
                </View>
            </View>
        );
    }

    // Se for a Home, exibe apenas os grupos existentes (estático)
    if (home) {
        return (
            <View style={styles.container}>
                <ExistingGroups groups={groups} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>
                GRUPOS CADASTRADOS (SEGURE PARA REORDENAR)
            </Text>

            <View style={styles.scrollWrapper}>
                <DraggableFlatList
                    data={groups}
                    keyExtractor={(item) => item.id.toString()}
                    onDragEnd={({ data }) => onDragEnd?.(data)}
                    activationDistance={20} // Importante para não conflitar com o scroll do Parallax
                    renderItem={({ item, drag, isActive }) => (
                        <ScaleDecorator>
                            <TouchableOpacity
                                onLongPress={drag} // Ativa o arrasto ao segurar
                                disabled={isActive}
                                activeOpacity={1}
                                style={[
                                    styles.dragItem,
                                    { opacity: isActive ? 0.7 : 1 },
                                ]}
                            >
                                <GroupCard
                                    group={item}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </TouchableOpacity>
                        </ScaleDecorator>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scrollWrapper: {
        height: 180, // ALTURA FIXA: Escolha um valor que caiba bem na tela
        backgroundColor: "rgba(255,255,255,0.03)", // Fundo sutil para delimitar a área
        borderRadius: 10,
        padding: 5,
    },
    dragItem: {
        marginBottom: 8, // Espaço entre os cards durante a lista
    },
    emptyCard: {
        backgroundColor: "#E6E8FA",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    emptyText: {
        color: "#8A9AFA",
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default GroupList;
