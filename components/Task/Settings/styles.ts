import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    settingsContainer: {
        height: 100,
        // margin: 12,
        padding: 10,
        backgroundColor: "#B7C5FE",
        borderRadius: 10,
        width: "40%",
        alignItems: "center",

        marginBottom: 10,
    },
    buttonGroup: {
        borderBottomColor: "#7D8BF7",
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 10,
        width: "90%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    iconWrap: {
        justifyContent: "center",
        alignItems: "center",
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: "#7D8BF7",
    },
    text: {
        marginLeft: 8,
        fontWeight: "bold",
        fontSize: 20,
    },
});
