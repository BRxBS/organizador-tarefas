import { FlatList, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import ItemGroup, { DATA } from "../GroupItem";
import { styles } from "./styles";

export default function ExistingGroups() {
    return (
        <View>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Grupos</ThemedText>
                <Link href="/day">
                    <View style={styles.wrapPlus}>
                        <AntDesign name="plus" size={18} color="white" />
                    </View>
                </Link>
            </ThemedView>
            <View>
                <FlatList
                    data={DATA}
                    renderItem={({ item }) => (
                        <ItemGroup
                            item={item}
                            onPress={() => {
                                /* handle press */
                            }}
                            backgroundColor="#fff"
                            textColor="#000"
                        />
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    );
}
