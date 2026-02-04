import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

export default function TaskSettings() {
    return (
        <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.buttonGroup}>
                <View style={styles.iconWrap}>
                    <FontAwesome6
                        name="group-arrows-rotate"
                        size={24}
                        color="black"
                    />
                </View>
                <Text style={styles.text}>GRUPO</Text>
            </TouchableOpacity>
            <View>
                {/* has to be a FlatList */}
                <Text>Manhã</Text>
            </View>
        </View>
    );
}
