import ExistingGroups from "@/components/Home/ExistingGroups";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GroupCard from "../GroupCard";

interface GroupListProps {
    groups: any[];
    home: boolean;
    onEdit?: (group: any) => void;
    onDelete?: (id: string) => void;
}

const GroupList = ({ groups, home, onEdit, onDelete }: GroupListProps) => {
    return (
        <View style={styles.container}>
            {!home && (
                <Text style={styles.sectionTitle}>GRUPOS CADASTRADOS</Text>
            )}
            {/* Container com altura fixa e Scroll */}
            <View style={styles.scrollWrapper}>
                <ScrollView
                    nestedScrollEnabled={true} // Necessário para funcionar dentro do Parallax
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={
                        groups.length === 0 && {
                            flex: 1,
                            justifyContent: "center",
                        }
                    }
                >
                    {groups.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>
                                NENHUM GRUPO REGISTRADO ATÉ O MOMENTO
                            </Text>
                        </View>
                    ) : home ? (
                        <ExistingGroups groups={groups} />
                    ) : (
                        groups.map((item: any) => (
                            <GroupCard
                                key={item.id}
                                group={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scrollWrapper: {
        height: 200, // ALTURA FIXA: Escolha um valor que caiba bem na tela
        backgroundColor: "rgba(255,255,255,0.03)", // Fundo sutil para delimitar a área
        borderRadius: 10,
        padding: 5,
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
