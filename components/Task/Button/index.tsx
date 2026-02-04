import { Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

export default function Button({ text }: { text: string }) {
    return (
        // <View style={styles.settingsContainer}>
        <TouchableOpacity
            style={[
                styles.button,
                text === "Cancelar" && { backgroundColor: "#a14242" },
            ]}
        >
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>

        // </View>
    );
}
