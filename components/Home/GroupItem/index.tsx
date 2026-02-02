import { Text, TouchableOpacity } from "react-native";

import { styles } from "./styles";

type ItemData = {
    id: string;
    title: string;
};

export const DATA: ItemData[] = [
    {
        id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
        title: "First Item",
    },
    {
        id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
        title: "Second Item",
    },
    {
        id: "58694a0f-3da1-471f-bd96-145571e29d72",
        title: "Third Item",
    },
];
type ItemProps = {
    item: ItemData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};
export default function ItemGroup({
    item,
    onPress,
    backgroundColor,
    textColor,
}: ItemProps) {
    return (
        <TouchableOpacity
            // onPress={onPress}
            style={styles.container}
        >
            <Text
            // style={[styles.title, { color: textColor }]}
            >
                {item.title}
            </Text>
        </TouchableOpacity>
    );
}
