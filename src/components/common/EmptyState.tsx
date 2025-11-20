import {View, Text} from "react-native";

// EmptyState component
const EmptyState = ({message}: {message: string}) => (
  <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
    <Text style={{fontSize: 16, color: "#999"}}>{message}</Text>
  </View>
);

export default EmptyState;
