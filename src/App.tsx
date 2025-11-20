import React, {useEffect} from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useAuth} from "@hooks/useAuth";
import RootNavigator from "@navigation/RootNavigator";

const AppContent = () => {
  const {isLoading, isAuthenticated, restoreSession} = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <RootNavigator isLoading={isLoading} isAuthenticated={isAuthenticated} />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
