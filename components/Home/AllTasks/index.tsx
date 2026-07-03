import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function AllTasks() {
    const router = useRouter();

    return (
        <TouchableOpacity
            // A cor de fundo agora vem da coluna 'cor' do banco de dados
            style={[styles.container, { backgroundColor: "#8A9AFA" }]}
            onPress={() => router.push("/screens/all-tasks")} // Vai para a tela de edição
        >
            <Text style={styles.title}>TODAS AS TAREFAS</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    title: {
        color: "#1E1E1E",
        fontWeight: "bold",
        fontSize: 14,
    },
});
