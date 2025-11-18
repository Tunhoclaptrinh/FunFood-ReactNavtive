import React from "react";
import {View, StyleSheet} from "react-native";
import {SearchBar as AntSearchBar} from "@ant-design/react-native";
import {colors} from "@constants/colors";

interface SearchBarProps {
  onSearch: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, placeholder = "Search..."}) => {
  return (
    <View style={styles.container}>
      <AntSearchBar placeholder={placeholder} onChangeText={onSearch} style={styles.searchBar} />
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
  searchBar: {
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
});

export default SearchBar;
