import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { SQLiteProvider } from "expo-sqlite";
import { initializeDatabase } from "../database/initializeDatabase";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (Platform.OS === "android") {
            // Define a cor de fundo (mesma do seu rodapé ou fundo do app)
            NavigationBar.setBackgroundColorAsync("#11181C");

            // Define o estilo dos botões/risquinho (light = branco, dark = preto)
            NavigationBar.setButtonStyleAsync("light");

            // Se você quiser que ela seja totalmente opaca (não transparente)
            // NavigationBar.setBehaviorAsync('overlay-swipe');
        }
    }, []);

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <SQLiteProvider
                databaseName="database.db"
                onInit={initializeDatabase}
            >
                <Suspense fallback={<ActivityIndicator size="large" />}>
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="screens/[id]"
                            options={{
                                headerShown: false, // Recomendado esconder o header padrão já que você usa o Parallax
                                title: "Detalhes do Dia",
                            }}
                        />
                        <Stack.Screen
                            name="screens/all-tasks"
                            options={{
                                headerShown: false, // Recomendado esconder o header padrão já que você usa o Parallax
                                title: "Todas as tarefas",
                            }}
                        />
                    </Stack>
                </Suspense>
                <StatusBar style="auto" />
            </SQLiteProvider>
        </ThemeProvider>
    );
}
