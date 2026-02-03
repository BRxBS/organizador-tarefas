import { TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
// import ItemGroup, { DATA } from "../GroupItem";
import { styles } from "./styles";

export default function TaskName() {
    return (
        <View>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Nome da tarefa*</ThemedText>
                {/* <View style={styles.wrapPlus}>
                    <AntDesign name="plus" size={18} color="white" />
                </View> */}
            </ThemedView>
            <View>
                <TextInput
                    style={styles.input}
                    // onChangeText={onChangeText}
                    // value={text}
                />
            </View>
        </View>
    );
}
