import {Region} from "react-native-maps";
import {Location as MapLocation, MapMarker} from "@services/map.service"; // Alias Location interface to avoid conflict

export interface MapViewProps {
  markers?: MapMarker[];
  showRoute?: boolean;
  destination?: MapLocation;
  onMarkerPress?: (marker: MapMarker) => void;
  enableTracking?: boolean;
  initialRegion?: Region;
  style?: any;
}
