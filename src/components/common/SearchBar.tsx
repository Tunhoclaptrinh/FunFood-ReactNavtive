import React from "react";
import {View, TextInput, StyleSheet} from "react-native";
import {Search} from "lucide-react-native";
import {colors} from "@constants/colors";

interface SearchBarProps {
  onSearch: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, placeholder = "Search..."}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" style={styles.icon} />
        <TextInput placeholder={placeholder} onChangeText={onSearch} style={styles.input} placeholderTextColor="#999" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
});

export default SearchBar;
