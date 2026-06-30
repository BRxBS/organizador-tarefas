import { DAY_COLORS } from "@/util/colors";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ItemDay({ item, index }: any) {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[
                styles.dayBox,
                { backgroundColor: DAY_COLORS[index % DAY_COLORS.length] },
            ]}
            onPress={() =>
                router.push({
                    pathname: "/screens/[id]",
                    params: { id: item.id, title: item.title },
                } as any)
            }
        >
            <Text style={styles.dayText}>{item.title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    dayBox: {
        width: "30%", // Define a largura para caber 3 por linha
        aspectRatio: 1, // FORÇA o formato de quadrado perfeito
        borderRadius: 20, // Bordas arredondadas como na imagem
        justifyContent: "center", // Centraliza o texto verticalmente
        alignItems: "center", // Centraliza o texto horizontalmente
        margin: "1.5%",
    },
    dayText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600", // Texto um pouco mais grosso
        textAlign: "center",
        paddingVertical: 30,
    },
});
