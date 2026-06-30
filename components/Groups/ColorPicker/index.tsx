import { GROUP_COLORS } from "@/util/colors";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const ColorPicker = ({
    selectedColor,
    onSelect,
}: {
    selectedColor: string;
    onSelect: (c: string) => void;
}) => (
    <View style={styles.grid}>
        {GROUP_COLORS.map((c) => (
            <TouchableOpacity
                key={c}
                onPress={() => onSelect(c)}
                style={[
                    styles.option,
                    { backgroundColor: c },
                    selectedColor === c && styles.selected,
                ]}
            />
        ))}
    </View>
);

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    option: { width: "18%", height: 40, borderRadius: 8, marginBottom: 10 },
    selected: { borderWidth: 3, borderColor: "#FFF" },
});

export default ColorPicker;
