import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ItemGroup({ item }: any) {
    const router = useRouter();

    return (
        <TouchableOpacity
            // A cor de fundo agora vem da coluna 'cor' do banco de dados
            style={[
                styles.container,
                { backgroundColor: item.cor || "#8A9AFA" },
            ]}
            onPress={() => router.push("/groups")} // Vai para a tela de edição
        >
            <Text style={styles.title}>{item.nome.toUpperCase()}</Text>

            {/* Exibe o intervalo de horas salvo no banco */}
            <Text style={styles.time}>
                {item.hora_inicio} até {item.hora_fim}
            </Text>
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
    time: {
        color: "#1E1E1E",
        fontSize: 12,
    },
});
