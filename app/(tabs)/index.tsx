import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import GroupList from "@/components/Groups/GroupList";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import Days from "../../components/Home/Days";
import { useGroupDatabase } from "../../database/useGroupDatabase"; // Certifique-se do caminho correto

export default function HomeScreen() {
    const groupDb = useGroupDatabase();
    const router = useRouter();
    const [groups, setGroups] = useState<any[]>([]);

    // Atualiza os grupos toda vez que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            loadGroups();
        }, []),
    );

    async function loadGroups() {
        const data = await groupDb.getAll();
        setGroups(data);
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#2B306E", dark: "#2B306E" }}
            title="ORGANIZE"
            headerHeight={150}
        >
            <View style={styles.container}>
                {/* Cabeçalho Grupos com ícone de engrenagem */}
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>GRUPOS</ThemedText>
                    <TouchableOpacity onPress={() => router.push("/groups")}>
                        <Ionicons
                            name="settings-sharp"
                            size={20}
                            color="#8A9AFA"
                        />
                    </TouchableOpacity>
                </View>
                <GroupList home={true} groups={groups} />

                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>DIAS</ThemedText>
                </View>

                <Days />
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        marginTop: 10,
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
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
