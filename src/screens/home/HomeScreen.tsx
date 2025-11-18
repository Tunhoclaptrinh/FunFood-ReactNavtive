import React, {useEffect} from "react";
import {View, StyleSheet, FlatList, Text} from "react-native";
import {useQuery} from "@tanstack/react-query";
import {restaurantApi} from "@api/restaurant.api";
import {Spin} from "@ant-design/react-native";
import RestaurantCard from "@components/features/RestaurantCard";
import SearchBar from "@components/common/SearchBar";

const HomeScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const {data, isLoading, error} = useQuery({
    queryKey: ["restaurants", searchTerm],
    queryFn: () => restaurantApi.getAll({_page: 1, _limit: 20, q: searchTerm}),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Spin />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={setSearchTerm} placeholder="Search restaurants..." />

      <FlatList
        data={data?.data?.data || []}
        renderItem={({item}) => <RestaurantCard restaurant={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No restaurants found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default HomeScreen;
