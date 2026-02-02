// import Days from "@/components/Home/Days";
import Days from "@/components/Home/Days";
import ExistingGroups from "@/components/Home/ExistingGroups";
import ParallaxScrollView from "@/components/parallax-scroll-view";

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#2B306E" }}
            title="ORGANIZE"
            // headerImage={
            //     <Image
            //         source={require("@/assets/images/partial-react-logo.png")}
            //         style={styles.reactLogo}
            //     />
            // }
        >
            <ExistingGroups />
            <Days />
        </ParallaxScrollView>
    );
}
