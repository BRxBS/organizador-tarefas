import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { DeleteTaskModal } from "@/components/DayOfTheWeek/DeleteTaskModal";
import { TaskCard } from "@/components/DayOfTheWeek/TaskCard";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { DAY_COLORS } from "@/util/colors";

export default function DayOfTheWeekScreen() {
    const router = useRouter();
    const { id, title } = useLocalSearchParams();
    const taskDb = useTaskDatabase();
    const dayIndex = Number(id);
    const headerColor = DAY_COLORS[dayIndex] || "#A1CEDC";

    const [tasks, setTasks] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const loadTasks = async () => {
        const data = await taskDb.getTasksByDay(dayIndex);
        setTasks(data);
    };

    useEffect(() => {
        loadTasks();
    }, [id]);

    const openDeleteModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setModalVisible(true);
    };

    const handleDeleteDay = async () => {
        if (selectedTaskId) {
            await taskDb.removeSpecificDay(selectedTaskId, dayIndex);
            setModalVisible(false);
            loadTasks();
        }
    };

    const handleDeleteAll = async () => {
        if (selectedTaskId) {
            await taskDb.remove(selectedTaskId);
            setModalVisible(false);
            loadTasks();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ParallaxScrollView
                headerBackgroundColor={{
                    light: DAY_COLORS[Number(id)],
                    dark: DAY_COLORS[Number(id)],
                }}
                title={title as string}
            >
                <View style={styles.listContainer}>
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false} // ParallaxScrollView já tem scroll
                        renderItem={({ item }) => (
                            <TaskCard
                                task={item}
                                onEdit={(id) =>
                                    router.push({
                                        pathname: "/task",
                                        params: { id },
                                    })
                                }
                                onDelete={openDeleteModal}
                            />
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Nenhuma tarefa para este dia.
                            </Text>
                        }
                    />
                </View>
            </ParallaxScrollView>

            <DeleteTaskModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onDeleteDay={handleDeleteDay}
                onDeleteAll={handleDeleteAll}
            />

            {/* Botão Flutuante (FAB) */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: headerColor }]}
                onPress={() => router.push("/(tabs)/task")}
            >
                <FontAwesome6 name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: { padding: 20 },
    emptyText: {
        color: "#999",
        textAlign: "center",
        marginTop: 50,
        fontWeight: "bold",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
