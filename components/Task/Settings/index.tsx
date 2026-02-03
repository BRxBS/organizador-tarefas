import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { styles } from "./styles";

export default function TaskSettings() {
    return (
        <View style={styles.settingsContainer}>
            <View>
                <FontAwesome6
                    name="group-arrows-rotate"
                    size={24}
                    color="black"
                />
                <Text>GRUPO</Text>
            </View>
            <View>
                <Text>Manhã</Text>
            </View>
        </View>
    );
}
