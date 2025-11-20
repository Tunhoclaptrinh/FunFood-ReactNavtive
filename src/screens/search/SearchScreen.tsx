import React, {useState} from "react";
import {View, StyleSheet} from "react-native";
import Input from "@components/common/Input";
import {COLORS} from "@/src/config/constants";

const SearchScreen = () => {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <Input
        placeholder="Search restaurants or food..."
        value={query}
        onChangeText={setQuery}
        containerStyle={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE, padding: 16},
  input: {marginVertical: 8},
});

export default SearchScreen;
