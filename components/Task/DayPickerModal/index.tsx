import { DAY_COLORS } from "@/util/colors";
import { DAYS_DATA } from "@/util/days";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DayPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (selectedIds: number[]) => void;
    initialSelection: number[];
}

export default function DayPickerModal({
    visible,
    onClose,
    onConfirm,
    initialSelection,
}: DayPickerModalProps) {
    // Filtra apenas dias de rotina (0-6) para o estado interno
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            const routineOnly = initialSelection.filter((id) => id >= 0);
            setSelected(routineOnly);
        }
    }, [visible, initialSelection]);

    const toggleDay = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const toggleAll = () => {
        if (selected.length === 7) setSelected([]);
        else setSelected([0, 1, 2, 3, 4, 5, 6]);
    };

    const toggleWorkDays = () => {
        const workDays = [1, 2, 3, 4, 5];
        const isWorkDaysSelected =
            workDays.every((d) => selected.includes(d)) &&
            selected.length === 5;
        if (isWorkDaysSelected) setSelected([]);
        else setSelected(workDays);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>ROTINA SEMANAL</Text>
                    <View style={styles.divider} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={styles.specialRow}
                            onPress={toggleAll}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    selected.length === 7 &&
                                        styles.checkboxSelected,
                                ]}
                            />
                            <Text style={styles.specialText}>
                                TODOS OS DIAS
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.specialRow}
                            onPress={toggleWorkDays}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    selected.length === 5 &&
                                        selected.includes(1) &&
                                        !selected.includes(0) &&
                                        styles.checkboxSelected,
                                ]}
                            />
                            <Text style={styles.specialText}>
                                DIAS ÚTEIS (SEG A SEX)
                            </Text>
                        </TouchableOpacity>

                        <View
                            style={[styles.divider, { marginVertical: 15 }]}
                        />

                        {DAYS_DATA.map((day, index) => {
                            const dayId = Number(day.id);
                            const isSelected = selected.includes(dayId);
                            return (
                                <TouchableOpacity
                                    key={day.id}
                                    style={styles.dayRow}
                                    onPress={() => toggleDay(dayId)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected &&
                                                styles.checkboxSelected,
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.dayButton,
                                            {
                                                backgroundColor:
                                                    DAY_COLORS[index],
                                            },
                                        ]}
                                    >
                                        <Text style={styles.dayText}>
                                            {day.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelBtnText}>CANCELAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                selected.length === 0 && styles.btnDisabled,
                            ]}
                            onPress={() => onConfirm(selected)}
                            disabled={selected.length === 0}
                        >
                            <Text style={styles.saveBtnText}>SALVAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#E6E8FA",
        width: "90%",
        borderRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    title: {
        textAlign: "center",
        fontWeight: "bold",
        color: "#4A55A2",
        fontSize: 16,
        marginBottom: 10,
    },
    divider: { height: 1, backgroundColor: "#CCC" },
    specialRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 15,
    },
    specialText: { fontWeight: "bold", color: "#4A55A2", fontSize: 14 },
    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 15,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#8A9AFA",
    },
    checkboxSelected: { backgroundColor: "#4A55A2", borderColor: "#4A55A2" },
    dayButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
    dayText: { color: "#FFF", fontWeight: "bold" },
    footer: { marginTop: 20, flexDirection: "row", gap: 10 },
    saveBtn: {
        flex: 2,
        backgroundColor: "#4FB0D1",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#F25555",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    btnDisabled: { opacity: 0.5 },
    saveBtnText: { color: "#FFF", fontWeight: "bold" },
    cancelBtnText: { color: "#FFF", fontWeight: "bold" },
});

// import { COLOR_AMANHA, COLOR_HOJE, DAY_COLORS } from "@/util/colors";
// import { DAYS_DATA, DAY_AMANHA, DAY_HOJE } from "@/util/days";
// import React, { useEffect, useState } from "react";
// import {
//     Modal,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";

// interface DayPickerModalProps {
//     visible: boolean;
//     onClose: () => void;
//     onConfirm: (selectedIds: number[]) => void;
//     initialSelection: number[];
// }

// export default function DayPickerModal({
//     visible,
//     onClose,
//     onConfirm,
//     initialSelection,
// }: DayPickerModalProps) {
//     const [selected, setSelected] = useState<number[]>(initialSelection);

//     useEffect(() => {
//         if (visible) setSelected(initialSelection);
//     }, [visible]);

//     const toggleTemporaryDay = (id: number) => {
//         // Se já estiver selecionado, desmarca tudo
//         if (selected.includes(id)) {
//             setSelected([]);
//         } else {
//             // Se selecionar Hoje ou Amanhã, limpa qualquer outro dia
//             setSelected([id]);
//         }
//     };

//     const toggleRegularDay = (id: number) => {
//         let newSelection = [...selected];

//         // Se havia "Hoje" ou "Amanhã" selecionado, limpa-os antes de adicionar um dia comum
//         if (
//             newSelection.includes(DAY_HOJE) ||
//             newSelection.includes(DAY_AMANHA)
//         ) {
//             newSelection = [];
//         }

//         if (newSelection.includes(id)) {
//             newSelection = newSelection.filter((item) => item !== id);
//         } else {
//             newSelection.push(id);
//         }
//         setSelected(newSelection);
//     };

//     const toggleAll = () => {
//         const isAllSelected =
//             selected.length === 7 && !selected.includes(DAY_HOJE);
//         if (isAllSelected) setSelected([]);
//         else setSelected([0, 1, 2, 3, 4, 5, 6]);
//     };
//     const toggleWorkDays = () => {
//         const workDays = [1, 2, 3, 4, 5];
//         const isWorkDaysSelected =
//             workDays.every((d) => selected.includes(d)) &&
//             selected.length === 5;

//         if (isWorkDaysSelected) setSelected([]);
//         else setSelected(workDays);
//     };

//     return (
//         <Modal visible={visible} transparent animationType="fade">
//             <View style={styles.overlay}>
//                 <View style={styles.modalContent}>
//                     <Text style={styles.title}>DIAS DA TAREFA</Text>
//                     <View style={styles.divider} />

//                     <ScrollView showsVerticalScrollIndicator={false}>
//                         {/* SEÇÃO: TAREFAS TEMPORÁRIAS */}
//                         <Text style={styles.sectionTitle}>
//                             TEMPORÁRIO (ÚNICO)
//                         </Text>

//                         <TouchableOpacity
//                             style={styles.dayRow}
//                             onPress={() => toggleTemporaryDay(DAY_HOJE)}
//                         >
//                             <View
//                                 style={[
//                                     styles.checkbox,
//                                     selected.includes(DAY_HOJE) &&
//                                         styles.checkboxSelected,
//                                 ]}
//                             />
//                             <View
//                                 style={[
//                                     styles.dayButton,
//                                     { backgroundColor: COLOR_HOJE },
//                                 ]}
//                             >
//                                 <Text style={styles.dayText}>HOJE</Text>
//                             </View>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             style={styles.dayRow}
//                             onPress={() => toggleTemporaryDay(DAY_AMANHA)}
//                         >
//                             <View
//                                 style={[
//                                     styles.checkbox,
//                                     selected.includes(DAY_AMANHA) &&
//                                         styles.checkboxSelected,
//                                 ]}
//                             />
//                             <View
//                                 style={[
//                                     styles.dayButton,
//                                     { backgroundColor: COLOR_AMANHA },
//                                 ]}
//                             >
//                                 <Text style={styles.dayText}>AMANHÃ</Text>
//                             </View>
//                         </TouchableOpacity>

//                         <View
//                             style={[styles.divider, { marginVertical: 15 }]}
//                         />
//                         <Text style={styles.sectionTitle}>
//                             RECORRENTE (SEMANAL)
//                         </Text>

//                         {/* Opções Especiais Recorrentes */}
//                         <TouchableOpacity
//                             style={styles.specialRow}
//                             onPress={toggleAll}
//                         >
//                             <View
//                                 style={[
//                                     styles.checkbox,
//                                     selected.length === 7 &&
//                                         !selected.includes(DAY_HOJE) &&
//                                         styles.checkboxSelected,
//                                 ]}
//                             />
//                             <Text style={styles.specialText}>
//                                 TODOS OS DIAS
//                             </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             style={styles.specialRow}
//                             onPress={toggleWorkDays}
//                         >
//                             <View
//                                 style={[
//                                     styles.checkbox,
//                                     selected.length === 5 &&
//                                         selected.includes(1) &&
//                                         !selected.includes(0) &&
//                                         styles.checkboxSelected,
//                                 ]}
//                             />
//                             <Text style={styles.specialText}>
//                                 DIAS ÚTEIS (SEG A SEX)
//                             </Text>
//                         </TouchableOpacity>

//                         {/* Lista de dias individuais */}
//                         {DAYS_DATA.map((day, index) => {
//                             const dayId = Number(day.id);
//                             const isSelected = selected.includes(dayId);
//                             return (
//                                 <TouchableOpacity
//                                     key={day.id}
//                                     style={styles.dayRow}
//                                     onPress={() => toggleRegularDay(dayId)}
//                                 >
//                                     <View
//                                         style={[
//                                             styles.checkbox,
//                                             isSelected &&
//                                                 styles.checkboxSelected,
//                                         ]}
//                                     />
//                                     <View
//                                         style={[
//                                             styles.dayButton,
//                                             {
//                                                 backgroundColor:
//                                                     DAY_COLORS[index],
//                                             },
//                                         ]}
//                                     >
//                                         <Text style={styles.dayText}>
//                                             {day.title}
//                                         </Text>
//                                     </View>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </ScrollView>

//                     <View style={styles.footer}>
//                         <TouchableOpacity
//                             style={styles.cancelBtn}
//                             onPress={onClose}
//                         >
//                             <Text style={styles.cancelBtnText}>FECHAR</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={styles.saveBtn}
//                             onPress={() => onConfirm(selected)}
//                         >
//                             <Text style={styles.saveBtnText}>SALVAR</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// }

// const styles = StyleSheet.create({
//     // ... seus estilos anteriores ...
//     overlay: {
//         flex: 1,
//         backgroundColor: "rgba(0,0,0,0.7)",
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     modalContent: {
//         backgroundColor: "#E6E8FA",
//         width: "90%",
//         borderRadius: 20,
//         padding: 20,
//         maxHeight: "85%",
//     },
//     title: {
//         textAlign: "center",
//         fontWeight: "bold",
//         color: "#555",
//         fontSize: 16,
//         marginBottom: 10,
//     },
//     sectionTitle: {
//         fontSize: 12,
//         fontWeight: "bold",
//         color: "#888",
//         marginBottom: 10,
//         marginTop: 5,
//     },
//     divider: { height: 1, backgroundColor: "#CCC" },
//     specialRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: 10,
//         gap: 15,
//     },
//     specialText: { fontWeight: "bold", color: "#4A55A2", fontSize: 14 },
//     dayRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginBottom: 10,
//         gap: 15,
//     },
//     checkbox: {
//         width: 22,
//         height: 22,
//         borderRadius: 11,
//         borderWidth: 2,
//         borderColor: "#8A9AFA",
//     },
//     checkboxSelected: { backgroundColor: "#4A55A2", borderColor: "#4A55A2" },
//     dayButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
//     dayText: { color: "#FFF", fontWeight: "bold" },
//     footer: { marginTop: 20, flexDirection: "row", gap: 10 },
//     saveBtn: {
//         flex: 2,
//         backgroundColor: "#4FB0D1",
//         padding: 15,
//         borderRadius: 10,
//         alignItems: "center",
//     },
//     cancelBtn: {
//         flex: 1,
//         backgroundColor: "#F25555",
//         padding: 15,
//         borderRadius: 10,
//         alignItems: "center",
//     },
//     saveBtnText: { color: "#FFF", fontWeight: "bold" },
//     cancelBtnText: { color: "#FFF", fontWeight: "bold" },
// });
