import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { DaySelector } from "@/components/Task/DaySelector";
import TemporaryPickerModal from "@/components/Task/TemporaryPickerModal";
import { useGroupDatabase } from "@/database/useGroupDatabase";
import { useTaskDatabase } from "@/database/useTaskDatabase";
import { DAY_AMANHA, DAY_HOJE } from "@/util/days";
import { useLocalSearchParams, useRouter } from "expo-router";
import DayPickerModal from "../../components/Task/DayPickerModal";
import GroupPickerModal from "../../components/Task/GroupPickerModal";
import SettingCard from "../../components/Task/Settings";
import TaskInput from "../../components/Task/TaskInput";

export default function TaskScreen() {
    const { id } = useLocalSearchParams(); // Pega o ID da URL se existir
    const isEditing = !!id;

    const taskDb = useTaskDatabase();
    const groupDb = useGroupDatabase();
    const router = useRouter();

    // States
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [groups, setGroups] = useState<any[]>([]);
    const [grupoId, setGrupoId] = useState<number | null>(null);
    const [grupoNome, setGrupoNome] = useState("Selecionar");
    const [horaAlarme, setHoraAlarme] = useState<Date | null>(null);
    const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);

    // UI States
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showDaysModal, setShowDaysModal] = useState(false);
    const [showTempModal, setShowTempModal] = useState(false);
    const [showRoutineModal, setShowRoutineModal] = useState(false);

    const isFormValid =
        (nome?.trim() ?? "").trim().length > 0 &&
        diasSelecionados.length > 0 &&
        grupoId !== null;

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        groupDb.getAll().then(setGroups);
        taskDb.cleanupTemporaryTasks(); // Roda a limpeza ao abrir a tela
    }, []);

    useEffect(() => {
        async function loadTaskForEdit() {
            if (isEditing && id) {
                try {
                    // Como 'id' pode vir da URL como string ou string[], garantimos que é string
                    const taskIdStr = Array.isArray(id) ? id[0] : id;
                    const task = await taskDb.getById(Number(taskIdStr));

                    if (task) {
                        // O segredo está no '?? ""' para garantir que nunca passamos undefined
                        setNome(task.nome ?? "");
                        setDescricao(task.descricao ?? "");
                        setGrupoId(task.grupo_id ?? null);
                        setDiasSelecionados(task.dias ?? []);

                        // Busca o grupo
                        const allGroups = await groupDb.getAll();
                        const currentGroup = allGroups.find(
                            (g) => g.id === task.grupo_id,
                        );
                        if (currentGroup) {
                            setGrupoNome(currentGroup.nome);
                        }

                        // Lógica do Alarme...
                        if (task.alarme_hora) {
                            const timeMatch =
                                task.alarme_hora.match(/(\d+):(\d+)/);
                            if (timeMatch) {
                                const newDate = new Date();
                                newDate.setHours(
                                    parseInt(timeMatch[1]),
                                    parseInt(timeMatch[2]),
                                    0,
                                    0,
                                );
                                setHoraAlarme(newDate);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Erro ao carregar tarefa:", error);
                }
            }
        }
        loadTaskForEdit();
    }, [id, isEditing]);

    const handleOpenPicker = (type: "temp" | "routine") => {
        if (type === "temp") {
            setShowTempModal(true);
        } else {
            setShowRoutineModal(true);
        }
    };

    const filteredGroups = useMemo(() => {
        if (!diasSelecionados.includes(DAY_HOJE)) return groups;

        const agora = new Date();
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

        return groups.filter((grupo) => {
            const minutosFim = timeToMinutes(grupo.hora_fim);
            return minutosFim > minutosAgora;
        });
    }, [diasSelecionados, groups]);

    const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} H`;
    };
    const handleSave = async () => {
        if (!isFormValid) return;
        let diasParaSalvar = diasSelecionados;
        if (diasSelecionados.includes(DAY_HOJE)) diasParaSalvar = [DAY_HOJE];
        else if (diasSelecionados.includes(DAY_AMANHA))
            diasParaSalvar = [DAY_AMANHA];

        try {
            const taskData = {
                nome,
                descricao: descricao.trim() || null,
                grupo_id: grupoId!,
                alarme_hora: horaAlarme ? formatTime(horaAlarme) : null,
                dias: diasParaSalvar,
            };

            if (isEditing) {
                await taskDb.update(Number(id), taskData);
            } else {
                await taskDb.create(taskData);
            }

            Alert.alert(
                "Sucesso",
                isEditing ? "Tarefa atualizada!" : "Tarefa criada!",
                [{ text: "OK", onPress: () => router.back() }],
            );
        } catch (error) {
            Alert.alert("Erro", "Falha ao salvar.");
        }
    };

    const handleCancel = () => {
        // Verifica se o usuário preencheu qualquer coisa
        const isDirty =
            nome !== "" ||
            descricao !== "" ||
            grupoId !== null ||
            diasSelecionados.length > 0 ||
            horaAlarme !== null;

        if (!isDirty) {
            router.back();
            return;
        }

        Alert.alert(
            "Atenção",
            "Cancelar apagará todos os dados preenchidos. Tem certeza?",
            [
                { text: "Não continuar", style: "cancel" },
                {
                    text: "Sim, apagar",
                    style: "destructive",
                    onPress: () => {
                        // Limpa os campos
                        setNome("");
                        setDescricao("");
                        setGrupoId(null);
                        setGrupoNome("Selecionar");
                        setHoraAlarme(null);
                        setDiasSelecionados([]);
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {isEditing ? "EDITANDO TAREFA" : "CRIANDO TAREFA"}
                </Text>
            </View>

            {/* O ScrollView agora tem flex: 1 para empurrar o rodapé para baixo */}
            <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
            >
                <TaskInput
                    label="Nome da Tarefa*"
                    value={nome}
                    onChangeText={setNome}
                />

                <DaySelector
                    selectedIds={diasSelecionados}
                    onSelectType={(type) => {
                        if (type === "temp") {
                            setShowTempModal(true); // Abre modal de Hoje/Amanhã
                        } else {
                            setShowRoutineModal(true); // Abre o modal de Segunda a Domingo
                        }
                    }}
                />

                <TaskInput
                    label="Descrição"
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                />

                <View style={styles.row}>
                    <SettingCard
                        label="GRUPO*"
                        value={grupoNome}
                        onPress={() => setShowGroupModal(true)}
                    />

                    <SettingCard
                        label="ALARME"
                        value={
                            horaAlarme ? formatTime(horaAlarme) : "Sem Alarme"
                        }
                        onPress={() => setShowTimePicker(true)}
                    />
                </View>
            </ScrollView>

            {/* RODAPÉ FIXO NA PARTE INFERIOR */}
            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={handleCancel}
                >
                    <Text style={styles.btnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.btn,
                        styles.btnSave,
                        !isFormValid && styles.btnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!isFormValid}
                >
                    <Text style={styles.btnText}>SALVAR</Text>
                </TouchableOpacity>
            </View>

            {/* Pickers e Modais */}
            {showTimePicker && (
                <DateTimePicker
                    value={horaAlarme || new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(event, date) => {
                        setShowTimePicker(false);
                        if (event.type === "set" && date) setHoraAlarme(date);
                    }}
                />
            )}

            <GroupPickerModal
                visible={showGroupModal}
                groups={filteredGroups}
                onClose={() => setShowGroupModal(false)}
                onSelect={(id, nome) => {
                    setGrupoId(id);
                    setGrupoNome(nome);
                    setShowGroupModal(false);
                }}
            />
            <TemporaryPickerModal
                visible={showTempModal}
                initialSelection={diasSelecionados} // <-- Não esqueça desta prop
                onClose={() => setShowTempModal(false)}
                onSelect={(days) => {
                    setDiasSelecionados(days);
                    setShowTempModal(false);
                }}
            />

            <DayPickerModal
                visible={showRoutineModal}
                initialSelection={diasSelecionados.filter((id) => id >= 0)}
                onClose={() => setShowRoutineModal(false)}
                onConfirm={(days) => {
                    setDiasSelecionados(days);
                    setShowRoutineModal(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#222" },
    header: {
        backgroundColor: "#7DA0FA",
        paddingHorizontal: 20,
        paddingBottom: 25,
        paddingTop: 60,
    },
    headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
    form: { flex: 1, padding: 20 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 40,
    },

    // Estilos do Rodapé Fixo
    footerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "#1C1C1C", // Fundo levemente diferente para destacar
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    btn: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        minWidth: 140,
        alignItems: "center",
    },
    btnCancel: { backgroundColor: "#F0A5A5" },
    btnSave: { backgroundColor: "#4FB0D1" },
    btnDisabled: { backgroundColor: "#555", opacity: 0.5 }, // Estilo de desativado
    btnText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
});
