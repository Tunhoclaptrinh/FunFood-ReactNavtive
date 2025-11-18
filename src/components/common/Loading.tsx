import {View, ActivityIndicator} from "react-native";

// Loading component
const Loading = () => (
  <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
    <ActivityIndicator size="large" color="#FF6B35" />
  </View>
);

export default Loading;
