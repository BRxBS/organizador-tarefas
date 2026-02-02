import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    titleContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    wrapPlus: {
        padding: 10,
        backgroundColor: "#7D8BF7",
        borderRadius: 50,
    },
    wrapDays: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 10,
    },
});
