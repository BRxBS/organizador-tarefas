import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ItemDay, { DATA } from "../Day";
import { styles } from "./styles";

export default function Days() {
    return (
        <View>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Grupos</ThemedText>
                {/* <View style={styles.wrapPlus}>
                    <AntDesign name="plus" size={18} color="white" />
                </View> */}
            </ThemedView>
            <View style={styles.wrapDays}>
                {DATA.map((item, index) => (
                    <ItemDay
                        key={item.id}
                        item={item}
                        onPress={() => {}}
                        backgroundColor="#fff"
                        textColor="#000"
                    />
                ))}
                {DATA.length % 3 === 1 && (
                    <View style={{ width: "30%" }} /> // só um espaço vazio à esquerda
                )}
            </View>
        </View>
    );
}
