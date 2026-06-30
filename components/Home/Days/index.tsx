import { DAYS_DATA } from "@/util/days";
import { StyleSheet, View } from "react-native";
import ItemDay from "../ItemDay";

export default function Days() {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {DAYS_DATA.map((item, index) => (
                    <ItemDay key={item.id} item={item} index={index} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // padding: 20,
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        // justifyContent: "center", // Isso centraliza os itens, inclusive o último
        // gap: 12, // Cria o espaçamento uniforme entre os quadrados
    },
});
