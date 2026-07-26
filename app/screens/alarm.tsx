import { useGroupDatabase } from "@/database/useGroupDatabase";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlarmScreenProps {
    task: {
        nome: string;
        descricao: string | null;
        grupo_cor: string;
    };
    onClose: () => void;
}

interface TaskComGrupo {
    nome: string;
    descricao: string | null;
    grupo_cor: string;
}

export default function AlarmScreen() {
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const router = useRouter();
    const taskDb = useTaskDatabase();
    const groupDb = useGroupDatabase();

    const [task, setTask] = useState<TaskComGrupo | null>(null);
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    useEffect(() => {
        async function loadTask() {
            if (!taskId) return;
            const tarefa = await taskDb.getById(Number(taskId));
            if (!tarefa) return;

            const allGroups = await groupDb.getAll();
            const grupo = allGroups.find((g) => g.id === tarefa.grupo_id);
            setTask({
                nome: tarefa.nome ?? "",
                descricao: tarefa.descricao ?? null,
                grupo_cor: grupo?.cor ?? "#7B89F4",
            });
        }
        loadTask();
    }, [taskId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClose = () => {
        router.back();
    };

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require("../../assets/images/alarm.png")}
                    style={styles.image}
                    resizeMode="stretch"
                />
                <View
                    style={[
                        styles.titleWrapper,
                        { borderColor: task.grupo_cor || "#7B89F4" },
                    ]}
                >
                    <View
                        style={[
                            styles.titleInnerBorder,
                            { borderColor: task.grupo_cor || "#7B89F4" },
                        ]}
                    >
                        <Text style={styles.titleText}>
                            {task.nome.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        {task.descricao || "Sem descrição"}
                    </Text>
                </View>
            </View>
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{secondsElapsed}s</Text>

                <TouchableOpacity
                    style={[
                        styles.closeButton,
                        { backgroundColor: task.grupo_cor || "#7B89F4" },
                    ]}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Text style={styles.closeButtonText}>
                        <AntDesign name="close" size={24} color="white" />
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: 220,
        marginBottom: 50,
    },
    container: {
        flex: 1,
        backgroundColor: "#212121", // Cor de fundo escura conforme a imagem
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 50,
    },
    timerContainer: {
        alignItems: "center",
        justifyContent: "space-between",
    },
    timerText: {
        color: "#FFF",
        fontSize: 30,
        fontWeight: "300",
        opacity: 0.8,
        marginBottom: 20,
    },
    content: {
        alignItems: "center",
        width: "100%",
    },
    titleWrapper: {
        borderWidth: 2,
        padding: 4,
        borderRadius: 12,
        width: "85%",
    },
    titleInnerBorder: {
        borderWidth: 1,
        paddingVertical: 25,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    titleText: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 2,
    },
    descriptionContainer: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    descriptionText: {
        color: "#FFF",
        fontSize: 20,
        textAlign: "center",
        lineHeight: 28,
    },
    closeButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        // Sombra suave
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButtonText: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
    },
});
