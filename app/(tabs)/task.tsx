import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import Button from "@/components/Task/Button";
import TaskSettings from "@/components/Task/Settings";
import TaskDescription from "@/components/Task/TaskDescription";
import TaskName from "@/components/Task/TaskName";

export default function TaskScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#2B306E" }}
            title="CRIAR TAREFA"
            // headerImage={
            //     <Image
            //         source={require("@/assets/images/partial-react-logo.png")}
            //         style={styles.reactLogo}
            //     />
            // }
        >
            <TaskName />
            <TaskDescription />
            <View style={styles.settingsContainer}>
                <TaskSettings />
                <TaskSettings />
            </View>
            <View style={styles.buttonsContainer}>
                <Button text="Cancelar" />
                <Button text="Salvar" />
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    settingsContainer: {
        marginTop: 30,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 70,
    },
    buttonsContainer: {
        marginTop: 30,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 70,
    },
});
