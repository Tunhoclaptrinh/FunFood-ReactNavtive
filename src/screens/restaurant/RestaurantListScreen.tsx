import React, {useEffect} from "react";
import {View, FlatList, StyleSheet, Text, ActivityIndicator} from "react-native";
import SearchBar from "@components/common/SearchBar"; // Import default
import RestaurantCard from "@components/features/RestaurantCard"; // Import default
import {useApi} from "@hooks/useApi";
import {useFilter} from "@hooks/useFilter";
import {useDebounce} from "@hooks/useDebounce";
import {restaurantApi} from "@api/restaurant.api";
import {colors} from "@constants/colors";

// Component này cần được sửa lại để sử dụng đúng hooks
const RestaurantListScreen: React.FC = () => {
  const filter = useFilter();
  const searchTerm = useDebounce(filter.filters.q, 500);

  const apiRunner = React.useCallback(async () => {
    // API call logic
    return restaurantApi.getAll({
      page: filter.page,
      limit: filter.limit,
      q: searchTerm,
    });
  }, [filter.page, filter.limit, searchTerm]);

  const {data: paginatedData, loading, execute} = useApi(apiRunner);

  useEffect(() => {
    execute();
  }, [execute]);

  const listData = paginatedData?.data?.data || [];

  if (loading && listData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={(q) => filter.updateFilter("q", q)} placeholder="Search restaurants..." />
      <FlatList
        data={listData}
        renderItem={({item}) => <RestaurantCard restaurant={item} />}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={() => execute()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {padding: 8},
  centerContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
});

export default RestaurantListScreen; // Export default
