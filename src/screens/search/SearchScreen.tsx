import React, {useState} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  SectionList,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {RestaurantService} from "@services/restaurant.service";
import {ProductService} from "@services/product.service";
import {useDebounce} from "@hooks/useDebounce";
import Input from "@components/common/Input";
import Card from "@components/common/Card";
import EmptyState from "@components/common/EmptyState";
import Button from "@components/common/Button";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@/src/config/constants";

interface SearchResult {
  type: "restaurant" | "product";
  id: number;
  name: string;
  image?: string;
  subtitle?: string;
  rating?: number;
  distance?: number;
  price?: number;
  discount?: number;
  restaurantId?: number;
}

const SearchScreen = ({navigation}: any) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else if (debouncedQuery.length === 0) {
      setSearchResults([]);
      setSearched(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      setSearched(true);

      // Search both restaurants and products
      const [restaurantsRes, productsRes] = await Promise.all([
        RestaurantService.search(searchQuery, {page: 1, limit: 10}).catch(() => ({
          data: [],
        })),
        ProductService.search(searchQuery, {page: 1, limit: 10}).catch(() => ({
          data: [],
        })),
      ]);

      const restaurants: SearchResult[] = (restaurantsRes.data || []).map((r: any) => ({
        type: "restaurant" as const,
        id: r.id,
        name: r.name,
        image: r.image,
        subtitle: r.address,
        rating: r.rating,
        distance: r.distance,
      }));

      const products: SearchResult[] = (productsRes.data || []).map((p: any) => ({
        type: "product" as const,
        id: p.id,
        name: p.name,
        image: p.image,
        subtitle: `${formatCurrency(p.price)}${p.discount ? " -" + p.discount + "%" : ""}`,
        rating: p.rating,
        price: p.price,
        discount: p.discount,
        restaurantId: p.restaurantId,
      }));

      setSearchResults([...restaurants, ...products]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.push("RestaurantDetail", {restaurantId});
  };

  const handleProductPress = (productId: number) => {
    navigation.push("ProductDetail", {productId});
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSearched(false);
  };

  // Group results by type
  const groupedResults = [
    {
      title: "Restaurants",
      data: searchResults.filter((r) => r.type === "restaurant"),
    },
    {
      title: "Products",
      data: searchResults.filter((r) => r.type === "product"),
    },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.GRAY} style={styles.searchIcon} />
          <Input
            placeholder="Search restaurants or food..."
            value={query}
            onChangeText={setQuery}
            containerStyle={styles.inputStyle}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle-outline" size={20} color={COLORS.GRAY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && searched && searchResults.length === 0 && (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="search-outline"
            title="No Results Found"
            subtitle={`"${query}" not found. Try different keywords.`}
          />
        </View>
      )}

      {/* Initial State */}
      {!loading && !searched && query.length === 0 && (
        <View style={styles.initialStateContainer}>
          <Ionicons name="search-outline" size={80} color={COLORS.LIGHT_GRAY} style={styles.initialIcon} />
          <Text style={styles.initialTitle}>What would you like to eat?</Text>
          <Text style={styles.initialSubtitle}>Search for restaurants or food items</Text>

          {/* Quick Search Suggestions */}
          <View style={styles.suggestionsContainer}>
            <TouchableOpacity style={styles.suggestionButton} onPress={() => setQuery("Phở")}>
              <Ionicons name="leaf-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.suggestionText}>Phở</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.suggestionButton} onPress={() => setQuery("Pizza")}>
              <Ionicons name="fast-food-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.suggestionText}>Pizza</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.suggestionButton} onPress={() => setQuery("Burger")}>
              <Ionicons name="fast-food-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.suggestionText}>Burger</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.suggestionButton} onPress={() => setQuery("Sushi")}>
              <Ionicons name="water-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.suggestionText}>Sushi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      {!loading && searched && searchResults.length > 0 && (
        <SectionList
          sections={groupedResults}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() =>
                item.type === "restaurant" ? handleRestaurantPress(item.id) : handleProductPress(item.id)
              }
              activeOpacity={0.7}
            >
              <Card
                image={item.image}
                title={item.name}
                subtitle={item.subtitle}
                rating={item.rating}
                description={item.type === "restaurant" ? `${item.distance?.toFixed(1) || "0"}km away` : undefined}
              />
            </TouchableOpacity>
          )}
          renderSectionHeader={({section: {title, data}}) => (
            <View style={styles.sectionHeader}>
              <Ionicons
                name={title === "Restaurants" ? "storefront-outline" : "fast-food-outline"}
                size={18}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.sectionTitle}>
                {title} ({data.length})
              </Text>
            </View>
          )}
          contentContainerStyle={styles.resultsList}
          scrollEnabled={true}
        />
      )}

      {/* No Search Query */}
      {!loading && query.length === 1 && (
        <View style={styles.hintContainer}>
          <Ionicons name="information-circle-outline" size={40} color={COLORS.LIGHT_GRAY} />
          <Text style={styles.hintText}>Type at least 2 characters to search</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  inputStyle: {
    flex: 1,
    marginVertical: 0,
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  initialIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  initialTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
    textAlign: "center",
  },
  initialSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: "center",
    marginBottom: 32,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  suggestionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  hintContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: "center",
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  resultItem: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
});

export default SearchScreen;
