import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    label: string;
    value: string;
    onPress: () => void;
}

export default function SettingCard({ label, value, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.topRow}>
                <View style={styles.iconWrap}>
                    {label === "GRUPO*" && (
                        <MaterialCommunityIcons
                            name="select-group"
                            size={24}
                            color="#fff"
                        />
                    )}
                    {label === "ALARME" && (
                        <FontAwesome6 name="bell" size={24} color="#fff" />
                    )}
                </View>

                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.value} numberOfLines={1}>
                {value}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#94A3F8",
        width: "45%",
        borderRadius: 12,
        padding: 10,
        height: 100,
        justifyContent: "space-between",
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    iconWrap: {
        width: 35,
        height: 35,
        backgroundColor: "#7D8BF7",
        borderRadius: 30,
        marginRight: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    label: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginVertical: 5,
    },
    value: {
        color: "#FFF",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "500",
    },
});
