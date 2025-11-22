import {useNavigation as useRNNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import type {RouteParams} from "@/src/config/routes.config";
import {NavigationService} from "@/src/services/navigation.service";

type NavigationProp = NativeStackNavigationProp<RouteParams>;

export const useNavigation = () => {
  const navigation = useRNNavigation<NavigationProp>();

  return {
    // React Navigation methods
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    canGoBack: navigation.canGoBack,
    reset: navigation.reset,
    replace: navigation.replace as any,

    // Custom helper methods
    ...NavigationService,
  };
};

export default useNavigation;
