import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ColorPicker from "../ColorPicker";

export default function GroupForm({
    name,
    setName,
    start,
    setStart,
    end,
    setEnd,
    color,
    setColor,
    onSave,
    onCancel,
    isEditing,
}: any) {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<"start" | "end">("start");
    const isSaveDisabled = !name || !start || !end || !color;

    const onTimeChange = (event: any, selectedDate?: Date) => {
        // No Android, precisamos fechar o picker imediatamente
        setShowPicker(false);

        // Verificamos se o usuário clicou em 'OK' (tipo 'set')
        if (event.type === "set" && selectedDate) {
            // Formata a hora: pega a hora e o minuto e coloca um '0' na frente se for menor que 10
            const hours = selectedDate.getHours().toString().padStart(2, "0");
            const minutes = selectedDate
                .getMinutes()
                .toString()
                .padStart(2, "0");
            const timeString = `${hours}:${minutes}`;

            // Salva no estado correspondente
            if (pickerTarget === "start") {
                setStart(timeString);
            } else {
                setEnd(timeString);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.formTitle}>
                {isEditing ? "EDITAR GRUPO" : "REGISTRAR GRUPOS"}
            </Text>
            <View style={styles.wrapper}>
                <Text style={styles.label}>NOME:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: MANHÃ"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>HORA INÍCIO:</Text>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => {
                                setPickerTarget("start");
                                setShowPicker(true);
                            }}
                        >
                            {/* Exibe o valor da prop 'start' */}
                            <Text style={styles.timeText}>
                                {start || "00:00"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.label}>HORA FIM:</Text>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => {
                                setPickerTarget("end");
                                setShowPicker(true);
                            }}
                        >
                            {/* Exibe o valor da prop 'end' */}
                            <Text style={styles.timeText}>
                                {end || "00:00"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={new Date()}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onTimeChange}
                    />
                )}

                <Text style={styles.label}>COR:</Text>
                <ColorPicker selectedColor={color} onSelect={setColor} />

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                    >
                        <Text style={styles.btnTxt}>CANCELAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={isSaveDisabled}
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: isSaveDisabled
                                    ? "#666666"
                                    : "#4A90E2",
                            },
                        ]}
                        onPress={onSave}
                    >
                        <Text style={styles.btnTxt}>
                            {isEditing ? "ATUALIZAR" : "SALVAR"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    wrapper: { backgroundColor: "#333", padding: 20, borderRadius: 15 },
    formTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
        // textAlign: "center",
    },
    label: { color: "#FFF", fontSize: 11, marginTop: 10, marginBottom: 5 },
    input: {
        backgroundColor: "#E6E8FA",
        borderRadius: 10,
        padding: 12,
        color: "#333",
    },
    row: { flexDirection: "row" },
    timeButton: {
        backgroundColor: "#E6E8FA",
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
    },
    timeText: { color: "#333", fontSize: 16, fontWeight: "500" },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#E59A9A",
        padding: 12,
        borderRadius: 10,
        flex: 0.45,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#4A90E2",
        padding: 12,
        borderRadius: 10,
        flex: 0.45,
        alignItems: "center",
    },
    btnTxt: { color: "#FFF", fontWeight: "bold" },
});
