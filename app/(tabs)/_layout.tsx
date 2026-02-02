import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                        // <AntDesign name="plus" size={24} color="black" />
                    ),
                }}
            />
            <Tabs.Screen
                name="task"
                options={{
                    title: "Criar Tarefa",
                    tabBarIcon: ({ color }) => (
                        // <IconSymbol size={28} name="house.fill" color={color} />
                        <AntDesign name="plus" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="groups"
                options={{
                    title: "Criar Trupo",
                    tabBarIcon: ({ color }) => (
                        // <IconSymbol size={28} name="house.fill" color={color} />
                        <AntDesign name="plus" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name="paperplane.fill"
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
