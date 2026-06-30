import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
    label: string;
    value: string | null;
    onChangeText: (t: string) => void;
    placeholder?: string;
    multiline?: boolean;
}

export default function TaskInput({
    label,
    value,
    onChangeText,
    multiline,
}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                value={value || ""}
                onChangeText={onChangeText}
                multiline={multiline}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    input: {
        backgroundColor: "#B7C4FF",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: "#333",
    },
    textArea: { height: 100, textAlignVertical: "top" },
});
