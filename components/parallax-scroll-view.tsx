import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "./themed-text";

const DEFAULT_HEADER_HEIGHT = 200;

type Props = PropsWithChildren<{
    // headerImage: ReactElement;
    headerBackgroundColor: { dark: string; light: string };
    title: string;
    headerHeight?: number;
}>;

export default function ParallaxScrollView({
    children,
    headerBackgroundColor,
    title,
    headerHeight = DEFAULT_HEADER_HEIGHT,
}: Props) {
    const backgroundColor = useThemeColor({}, "background");
    const colorScheme = useColorScheme() ?? "light";
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollOffset(scrollRef);
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-DEFAULT_HEADER_HEIGHT, 0, DEFAULT_HEADER_HEIGHT],
                        [
                            -DEFAULT_HEADER_HEIGHT / 2,
                            0,
                            DEFAULT_HEADER_HEIGHT * 0.75,
                        ],
                    ),
                },
                {
                    scale: interpolate(
                        scrollOffset.value,
                        [-DEFAULT_HEADER_HEIGHT, 0, DEFAULT_HEADER_HEIGHT],
                        [2, 1, 1],
                    ),
                },
            ],
        };
    });

    return (
        <View style={{ backgroundColor, flex: 1 }}>
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: headerBackgroundColor[colorScheme],
                        height: headerHeight,
                    },
                    headerAnimatedStyle,
                ]}
            >
                <ThemedText style={styles.titleText}>{title}</ThemedText>
            </Animated.View>
            <ThemedView style={styles.content}>{children}</ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        overflow: "hidden",
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
        overflow: "hidden",
    },
    titleText: {
        color: "white",
        fontSize: 30,
        position: "absolute",
        bottom: 20,
        left: 20,
        zIndex: 100,
    },
});
