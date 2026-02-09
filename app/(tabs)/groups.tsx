import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";

export default function GroupsScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#2B306E" }}
            title="CRIAR GRUPOS"
            // headerImage={
            //     <Image
            //         source={require("@/assets/images/partial-react-logo.png")}
            //         style={styles.reactLogo}
            //     />
            // }
        ></ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
});
