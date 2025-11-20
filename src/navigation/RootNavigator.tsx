import React from "react";
import {ActivityIndicator, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

interface RootNavigatorProps {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({isLoading, isAuthenticated}) => {
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <NavigationContainer>{isAuthenticated ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

export default RootNavigator;
