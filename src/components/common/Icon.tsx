import React from "react";
import {
  Home,
  Search,
  ShoppingCart,
  ClipboardList,
  User,
  Star,
  MapPin,
  Phone,
  Mail,
  Edit,
  Heart,
  LogOut,
  Eye,
  EyeOff,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Menu,
  X,
  LucideIcon,
} from "lucide-react-native";

// Map tên icon từ MaterialCommunityIcons sang Lucide
const iconMap: Record<string, LucideIcon> = {
  home: Home,
  magnify: Search,
  shopping: ShoppingCart,
  "clipboard-list": ClipboardList,
  account: User,
  star: Star,
  "map-marker": MapPin,
  phone: Phone,
  email: Mail,
  "account-edit": Edit,
  heart: Heart,
  logout: LogOut,
  eye: Eye,
  "eye-off": EyeOff,
  "arrow-left": ArrowLeft,
  plus: Plus,
  "minus-circle": Minus,
  "plus-circle": Plus,
  delete: Trash2,
  "chevron-right": ChevronRight,
  menu: Menu,
  close: X,
  "cart-outline": ShoppingCart,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({name, size = 24, color = "#000", style}) => {
  const IconComponent = iconMap[name] || Home; // Fallback to Home icon

  return <IconComponent size={size} color={color} style={style} />;
};

export default Icon;
