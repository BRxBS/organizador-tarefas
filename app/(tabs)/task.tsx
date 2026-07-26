import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    NativeModules,
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
import { calcularProximoDisparo } from "@/util/alarme";
import { DAY_AMANHA, DAY_HOJE } from "@/util/days";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import DayPickerModal from "../../components/Task/DayPickerModal";
import GroupPickerModal from "../../components/Task/GroupPickerModal";
import SettingCard from "../../components/Task/Settings";
import TaskInput from "../../components/Task/TaskInput";
const { WidgetModule } = NativeModules;

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

    const resetForm = () => {
        setNome("");
        setDescricao("");
        setGrupoId(null);
        setGrupoNome("Selecionar");
        setHoraAlarme(null);
        setDiasSelecionados([]);
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

    useFocusEffect(
        useCallback(() => {
            // Esta função vai rodar sempre que você entrar na tela
            const loadData = async () => {
                try {
                    const allGroups = await groupDb.getAll();
                    setGroups(allGroups);

                    // Se estiver editando, atualiza o nome do grupo caso ele tenha mudado
                    if (isEditing && id) {
                        const taskIdStr = Array.isArray(id) ? id[0] : id;
                        const task = await taskDb.getById(Number(taskIdStr));
                        const currentGroup = allGroups.find(
                            (g) => g.id === task.grupo_id,
                        );
                        if (currentGroup) {
                            setGrupoNome(currentGroup.nome);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao atualizar grupos:", error);
                }
            };

            loadData();
            taskDb.cleanupTemporaryTasks();

            // Opcional: Log para você ver no terminal que atualizou
            console.log("Grupos recarregados na TaskScreen");
        }, [id, isEditing]), // Dependências do useCallback
    );

    const filteredGroups = useMemo(() => {
        if (!diasSelecionados.includes(DAY_HOJE)) return groups;

        const agora = new Date();
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

        return groups.filter((grupo) => {
            const minutosInicio = timeToMinutes(grupo.hora_inicio);
            let minutosFim = timeToMinutes(grupo.hora_fim);

            // Se o fim é <= início, o grupo cruza a meia-noite
            if (minutosFim <= minutosInicio) {
                minutosFim += 24 * 60;
            }
            console.log("GRUPOS BRUTOS:", JSON.stringify(groups));
            console.log("HORA AGORA (min):", minutosAgora);
            return minutosAgora < minutosFim;
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

            let taskId: number;
            if (isEditing) {
                taskId = Number(id);
                await taskDb.update(taskId, taskData);
            } else {
                const novoId = await taskDb.create(taskData);

                if (novoId === null) {
                    throw new Error("Falha ao criar tarefa: ID não retornado.");
                }

                taskId = novoId;
            }

            // Sempre cancela antes de reagendar — cobre edição de horário/dias
            cancelarTodosAlarmesDaTarefa(taskId);
            if (horaAlarme) {
                agendarAlarmesDaTarefa(taskId, horaAlarme, diasParaSalvar);
            }

            resetForm();
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
                        resetForm();
                        router.back();
                    },
                },
            ],
        );
    };

    function cancelarTodosAlarmesDaTarefa(taskId: number) {
        // Cancela os 7 possíveis (um por dia da semana) — cobre qualquer config anterior
        for (let dia = 0; dia <= 6; dia++) {
            WidgetModule.cancelAlarm(taskId * 10 + dia);
        }
    }

    function agendarAlarmesDaTarefa(
        taskId: number,
        hora: Date,
        dias: number[],
    ) {
        dias.forEach((dia) => {
            const alarmId = taskId * 10 + dia;
            const triggerTime = calcularProximoDisparo(
                dia,
                hora.getHours(),
                hora.getMinutes(),
            );
            WidgetModule.setExactAlarm(triggerTime, alarmId);
        });
    }

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
