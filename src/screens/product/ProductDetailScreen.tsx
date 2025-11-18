import React from "react";
import {View, Text, StyleSheet, ScrollView, Image, TouchableOpacity} from "react-native";
import {useRoute} from "@react-navigation/native";
import {colors} from "@constants/colors";

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const productId = route.params?.id;

  return (
    <ScrollView style={styles.container}>
      <Image source={{uri: "https://via.placeholder.com/400"}} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>Product Name</Text>
        <Text style={styles.price}>₫150,000</Text>
        <Text style={styles.description}>Product description goes here...</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  image: {width: "100%", height: 300},
  content: {padding: 16},
  name: {fontSize: 24, fontWeight: "bold"},
  price: {fontSize: 20, color: colors.primary, marginVertical: 8},
  description: {fontSize: 14, color: "#666", lineHeight: 20},
});

export default ProductDetailScreen;
