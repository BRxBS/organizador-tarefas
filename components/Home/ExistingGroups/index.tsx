import React from "react";
import { StyleSheet, View } from "react-native";
import ItemGroup from "../ ItemGroup"; // Importando o componente de item

// Recebemos os grupos via props da HomeScreen
export default function ExistingGroups({ groups }: { groups: any[] }) {
    return (
        <View style={styles.listContainer}>
            {/* 
               Usamos .map em vez de FlatList aqui porque a lista 
               está dentro de outro ScrollView (o Parallax).
            */}
            {groups.map((item) => (
                <ItemGroup key={item.id} item={item} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        marginBottom: 20, // Espaço entre a lista de grupos e a seção de dias
    },
});
