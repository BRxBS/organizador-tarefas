// import Days from "@/components/Home/Days";
import ParallaxScrollView from "@/components/parallax-scroll-view";

export default function HomeScreen() {
    // gonna need to send information of what day os the week is this,
    // probably through the link, and then use that information to set the state of the day component,
    // so it can show the correct day of the week
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
            {/* <ExistingGroups />
            <Days /> */}
        </ParallaxScrollView>
    );
}
