import React, {useEffect, useState} from "react";
import {View, FlatList, StyleSheet} from "react-native";
import {SearchBar} from "@components/common/SearchBar";
import {RestaurantCard} from "@components/features/RestaurantCard";
import {useApi} from "@hooks/useApi";
import {useFilter} from "@hooks/useFilter";
import {useDebounce} from "@hooks/useDebounce";
import {restaurantApi} from "@api/restaurant.api";
import {Restaurant} from "@types/models.types";

export const RestaurantListScreen: React.FC = () => {
  const filter = useFilter();
  const searchTerm = useDebounce(filter.filters.q, 500);
  const {data, loading, execute} = useApi(() =>
    restaurantApi.getAll({
      page: filter.page,
      limit: filter.limit,
      q: searchTerm,
    })
  );

  useEffect(() => {
    execute();
  }, [filter.page, filter.limit, searchTerm]);

  return (
    <View style={styles.container}>
      <SearchBar onSearch={(q) => filter.updateFilter("q", q)} placeholder="Search restaurants..." />
      <FlatList
        data={data}
        renderItem={({item}) => <RestaurantCard restaurant={item} />}
        keyExtractor={(item) => item.id.toString()}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
