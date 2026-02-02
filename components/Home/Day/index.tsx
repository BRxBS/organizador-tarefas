import { Text, ViewStyle } from "react-native";

import { Link } from "expo-router";
import { styles } from "./styles";

type ItemData = {
    id: string;
    title: string;
};

export const DATA: ItemData[] = [
    {
        id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
        title: "DOMINGO",
    },
    {
        id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
        title: "SEGUNDA",
    },
    {
        id: "58694a0f-3da1-461f-bd96-145571e29d72",
        title: "TERÇA",
    },
    {
        id: "58694a0f-3da1-371f-bd96-145571e29d72",
        title: "QUARTA",
    },
    {
        id: "58694a0f-3da1-471f4-bd96-145571e29d72",
        title: "QUINTA",
    },
    {
        id: "58694a0f-3da1-47341f-bd96-145571e29d72",
        title: "SEXTA",
    },
    {
        id: "58694a0f-3da1-47431f-bd96-145571e29d72",
        title: "SABADO",
    },
];
type ItemProps = {
    item: ItemData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    style?: ViewStyle;
};
export default function ItemDay({
    item,
    onPress,
    backgroundColor,
    textColor,
    style,
}: ItemProps) {
    return (
        <Link href="/modal" style={styles.container}>
            <Text
            // style={[styles.title, { color: textColor }]}
            >
                {item.title}
            </Text>
        </Link>
    );
}
