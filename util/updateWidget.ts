import { NativeModules } from "react-native";
const { WidgetModule } = NativeModules;

export const updateWidget = () => {
    console.log("Módulos nativos disponíveis:", Object.keys(NativeModules)); // Veja o que aparece aqui

    if (WidgetModule) {
        console.log("WidgetModule encontrado! Chamando update...");
        WidgetModule.updateWidget();
    } else {
        console.error(
            "ERRO: WidgetModule não foi encontrado no sistema nativo.",
        );
    }
};
