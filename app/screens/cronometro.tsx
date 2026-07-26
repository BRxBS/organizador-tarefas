import { useEffect, useRef, useState } from "react";
import {
    NativeEventEmitter,
    NativeModules,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { CronometroModule } = NativeModules;
const emitter = new NativeEventEmitter(CronometroModule);

function formatarTempo(ms: number): string {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const centesimos = Math.floor((ms % 1000) / 10);

    if (horas > 0) {
        return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }
    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}.${String(centesimos).padStart(2, "0")}`;
}

export default function CronometroScreen() {
    const [tempo, setTempo] = useState(0);
    const [rodando, setRodando] = useState(false);
    const subscription = useRef<any>(null);

    useEffect(() => {
        // Carrega estado atual ao abrir a tela
        CronometroModule.getEstado().then(
            (estado: { tempo: number; rodando: boolean }) => {
                setTempo(estado.tempo);
                setRodando(estado.rodando);
            },
        );

        // Escuta os ticks do service
        subscription.current = emitter.addListener(
            "CronometroTick",
            (ms: number) => {
                setTempo(ms);
            },
        );

        return () => {
            subscription.current?.remove();
        };
    }, []);

    const handleIniciarPausar = () => {
        if (rodando) {
            CronometroModule.pausar();
            setRodando(false);
        } else {
            CronometroModule.iniciar();
            setRodando(true);
        }
    };

    const handleResetar = () => {
        CronometroModule.resetar();
        setTempo(0);
        setRodando(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.tempo}>{formatarTempo(tempo)}</Text>

            <View style={styles.botoes}>
                <TouchableOpacity
                    style={[
                        styles.botao,
                        rodando ? styles.botaoPausar : styles.botaoIniciar,
                    ]}
                    onPress={handleIniciarPausar}
                >
                    <Text style={styles.botaoTexto}>
                        {rodando
                            ? "Pausar"
                            : tempo > 0
                              ? "Continuar"
                              : "Iniciar"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.botao, styles.botaoResetar]}
                    onPress={handleResetar}
                    disabled={tempo === 0}
                >
                    <Text
                        style={[
                            styles.botaoTexto,
                            tempo === 0 && styles.botaoDesabilitado,
                        ]}
                    >
                        Resetar
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#11181C",
        alignItems: "center",
        justifyContent: "center",
    },
    tempo: {
        fontSize: 64,
        fontWeight: "bold",
        color: "#FFFFFF",
        fontVariant: ["tabular-nums"],
        marginBottom: 60,
    },
    botoes: {
        flexDirection: "row",
        gap: 20,
    },
    botao: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        minWidth: 120,
        alignItems: "center",
    },
    botaoIniciar: {
        backgroundColor: "#8A9AFA",
    },
    botaoPausar: {
        backgroundColor: "#486C8D",
    },
    botaoResetar: {
        backgroundColor: "#333",
    },
    botaoTexto: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    botaoDesabilitado: {
        color: "#666",
    },
});
