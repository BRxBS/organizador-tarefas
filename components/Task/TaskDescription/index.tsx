import { TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
// import ItemGroup, { DATA } from "../GroupItem";
import { styles } from "./styles";

export default function TaskDescription() {
    return (
        <View>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Descrição da tarefa</ThemedText>
            </ThemedView>
            <View>
                <TextInput style={styles.input} />
            </View>
        </View>
    );
}
