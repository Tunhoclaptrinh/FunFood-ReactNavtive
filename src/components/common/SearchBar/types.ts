import {ViewStyle, TextStyle, TextInputProps} from "react-native";

export interface SearchBarProps {
  /** Giá trị hiện tại */
  value?: string;
  /** Callback khi text thay đổi (có debounce) */
  onChangeText?: (text: string) => void;
  /** Callback khi nhấn nút clear */
  onClear?: () => void;
  /** Callback khi nhấn Enter */
  onSubmit?: (text: string) => void;
  /** Callback khi focus */
  onFocus?: () => void;
  /** Callback khi blur */
  onBlur?: () => void;
  /** Placeholder text - mặc định "Search..." */
  placeholder?: string;
  /** Thời gian delay (ms) - mặc định 300 */
  debounceDelay?: number;
  /** Custom style cho container */
  containerStyle?: ViewStyle;
  /** Custom style cho input */
  inputStyle?: TextStyle;
  /** Màu icon - mặc định "#666" */
  iconColor?: string;
  /** Kích thước: "small" | "medium" | "large" - mặc định "medium" */
  size?: "small" | "medium" | "large";
  /** Loại nút return - mặc định "search" */
  returnKeyType?: TextInputProps["returnKeyType"];
  /** Chế độ tìm: "onChange" | "onSubmit" | "both" - mặc định "both" */
  searchMode?: "onChange" | "onSubmit" | "both";
  /** Tự động focus - mặc định false */
  autoFocus?: boolean;
  /** Có thể edit - mặc định true */
  editable?: boolean;
  /** Số ký tự tối đa */
  maxLength?: number;
  /** Độ dài tối thiểu để search - mặc định 0 */
  minSearchLength?: number;
  /** Hiện nút clear - mặc định true */
  showClearButton?: boolean;
  /** Nếu true, sẽ bỏ autoFocus ban đầu, ngay cả khi autoFocus=true */
  disableFocusOnMount?: boolean;

  showFocusBorder?: boolean;
}
