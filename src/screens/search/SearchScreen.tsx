import React, {useState} from "react";
import {View, Text, StyleSheet, FlatList} from "react-native";
import {useQuery} from "@tanstack/react-query";
import {restaurantApi} from "@api/restaurant.api";
import SearchBar from "@components/common/SearchBar";
import RestaurantCard from "@components/features/RestaurantCard";
import {Spin} from "@ant-design/react-native";
import {useDebounce} from "@hooks/useDebounce";

const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {data, isLoading} = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: () => restaurantApi.search(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  return (
    <View style={styles.container}>
      <SearchBar onSearch={setSearchTerm} placeholder="Search for restaurants..." />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Spin />
        </View>
      )}

      {!isLoading && searchTerm && (
        <FlatList
          data={data?.data?.data || []}
          renderItem={({item}) => <RestaurantCard restaurant={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      )}

      {!searchTerm && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Search for restaurants, dishes...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
  list: {padding: 8},
  emptyContainer: {flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40},
  emptyText: {fontSize: 16, color: "#999"},
  placeholderContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
  placeholderText: {fontSize: 16, color: "#ccc"},
});

export default SearchScreen;
