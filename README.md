# 🧭 FunFood Navigation System

## 📋 Tổng quan

Hệ thống navigation được refactor hoàn toàn với:

- ✅ **Type Safety** - TypeScript đầy đủ
- ✅ **Centralized Config** - Tất cả routes ở một nơi
- ✅ **Helper Methods** - Navigation methods dễ sử dụng
- ✅ **Reusable** - Có thể dùng ở mọi nơi (components, services, utils)
- ✅ **Pattern chuẩn** - Theo mô hình của Backend

## 📁 Cấu trúc Files

```
src/
├── config/
│   └── routes.config.ts          # ⭐ Routes configuration
├── services/
│   └── navigation.service.ts     # ⭐ Navigation service
├── hooks/
│   └── useNavigation.ts          # ⭐ Navigation hook
└── navigation/
    ├── index.ts                  # Central exports
    ├── RootNavigator.tsx         # Main navigator
    ├── MainNavigator.tsx         # Customer flow
    ├── AuthNavigator.tsx         # Auth flow
    └── ShipperNavigator.tsx      # Shipper flow
```

## 🚀 Cách sử dụng

### 1. Trong Components

```typescript
import {useNavigation} from "@/src/navigation";

const RestaurantCard = ({restaurant}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.toRestaurantDetail(restaurant.id)}>
      <Text>{restaurant.name}</Text>
    </TouchableOpacity>
  );
};
```

### 2. Trong Services / Utils

```typescript
import {NavigationService} from "@/src/navigation";

// Order service
export const handleOrderSuccess = (orderId: number) => {
  NavigationService.toOrderDetail(orderId);
};

// Error handler
export const handleAuthError = () => {
  NavigationService.toLogin();
};
```

### 3. Sử dụng Route Names

```typescript
import {ROUTE_NAMES} from "@/src/navigation";

navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {restaurantId: 1});
```

## 📖 API Reference

### NavigationService Methods

#### Home Flow

- `toHome()` - Navigate to home screen
- `toRestaurantDetail(restaurantId: number)` - View restaurant
- `toProductDetail(productId: number)` - View product

#### Cart Flow

- `toCart()` - View cart
- `toCheckout()` - Go to checkout

#### Orders Flow

- `toOrders()` - View orders list
- `toOrderDetail(orderId: number)` - View order detail

#### Profile Flow

- `toProfile()` - View profile
- `toEditProfile()` - Edit profile
- `toChangePassword()` - Change password
- `toAddressList()` - View addresses
- `toAddAddress(address?)` - Add/edit address
- `toFavoritesList()` - View favorites
- `toMyReviews()` - View reviews
- `toOrderStats()` - View statistics

#### Auth Flow

- `toLogin()` - Go to login
- `toRegister()` - Go to register

#### Shipper Flow

- `toShipperDashboard()` - Shipper dashboard
- `toShipperAvailableOrders()` - Available orders
- `toShipperDeliveries()` - Active deliveries
- `toShipperHistory()` - Delivery history

#### Navigation Actions

- `goBack()` - Go back
- `reset(routeName)` - Reset navigation stack
- `replace(name, params)` - Replace current screen

## 🔄 Migration Guide

### Before (❌ Old way)

```typescript
const OldComponent = ({navigation}) => {
  return (
    <View>
      <Button onPress={() => navigation.navigate("RestaurantDetail", {restaurantId: 1})} title="View Menu" />
      <Button onPress={() => navigation.navigate("Cart")} title="Go to Cart" />
    </View>
  );
};
```

### After (✅ New way)

```typescript
const NewComponent = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Button onPress={() => navigation.toRestaurantDetail(1)} title="View Menu" />
      <Button onPress={navigation.toCart} title="Go to Cart" />
    </View>
  );
};
```

## 📝 Examples

### Example 1: Restaurant List

```typescript
const RestaurantList = () => {
  const navigation = useNavigation();
  const {items} = useRestaurantStore();

  return (
    <FlatList
      data={items}
      renderItem={({item}) => (
        <RestaurantCard restaurant={item} onPress={() => navigation.toRestaurantDetail(item.id)} />
      )}
    />
  );
};
```

### Example 2: Order Success Flow

```typescript
const CheckoutScreen = () => {
  const navigation = useNavigation();

  const handleCheckout = async () => {
    try {
      const order = await OrderService.createOrder(data);

      // Navigate to order detail after success
      navigation.replace("OrderDetail", {orderId: order.id});
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return <Button title="Place Order" onPress={handleCheckout} />;
};
```

### Example 3: Protected Action

```typescript
const ProductDetail = ({productId}) => {
  const navigation = useNavigation();
  const {isAuthenticated} = useAuthStore();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Navigate to login if not authenticated
      navigation.toLogin();
      return;
    }

    // Add to cart and navigate
    addToCart(productId);
    navigation.toCart();
  };

  return <Button title="Add to Cart" onPress={handleAddToCart} />;
};
```

### Example 4: Deep Linking

```typescript
// Handle deep links
export const handleDeepLink = (url: string) => {
  const {path, params} = parseDeepLink(url);

  switch (path) {
    case "restaurant":
      NavigationService.toRestaurantDetail(params.id);
      break;
    case "product":
      NavigationService.toProductDetail(params.id);
      break;
    case "order":
      NavigationService.toOrderDetail(params.id);
      break;
    default:
      NavigationService.toHome();
  }
};
```

## 🎯 Best Practices

### ✅ DO

```typescript
// Use helper methods
navigation.toRestaurantDetail(1);
navigation.toCart();

// Use NavigationService outside components
const handleSuccess = () => {
  NavigationService.toOrders();
};

// Type-safe parameters
navigation.toOrderDetail(orderId); // ✅ Type checked
```

### ❌ DON'T

```typescript
// Don't use string literals
navigation.navigate("RestaurantDetail", {restaurantId: 1}); // ❌

// Don't pass navigation as prop if not needed
<MyComponent navigation={navigation} />; // ❌
```

## 🔧 Customization

### Adding New Routes

1. Update `routes.config.ts`:

```typescript
export const ROUTE_NAMES = {
  // ... existing routes
  NEW_FEATURE: {
    SCREEN: "NewFeatureScreen",
    DETAIL: "NewFeatureDetail",
  },
};
```

2. Add to `navigation.service.ts`:

```typescript
export const NavigationService = {
  // ... existing methods
  toNewFeature: () => navigate(ROUTE_NAMES.NEW_FEATURE.SCREEN),
  toNewFeatureDetail: (id: number) => navigate(ROUTE_NAMES.NEW_FEATURE.DETAIL, {id}),
};
```

3. Add screen to navigator:

```typescript
<Stack.Screen name={ROUTE_NAMES.NEW_FEATURE.SCREEN} component={NewFeatureScreen} />
```

## 🐛 Troubleshooting

### Issue: Navigation not working

**Solution**: Make sure `navigationRef` is properly set in `RootNavigator`:

```typescript
<NavigationContainer ref={navigationRef}>{/* navigators */}</NavigationContainer>
```

### Issue: Type errors

**Solution**: Update `RouteParams` type in `routes.config.ts`:

```typescript
export type RouteParams = {
  NewScreen: {id: number};
  // ...
};
```

## 📚 References

- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript with React Navigation](https://reactnavigation.org/docs/typescript/)
- [Backend Base Pattern](../backend/docs/ARCHITECTURE.md)

## 🎉 Benefits

1. **Type Safety** - Catch navigation errors at compile time
2. **Auto-complete** - IDE suggestions for routes and params
3. **Centralized** - All routes in one config file
4. **Reusable** - Use anywhere (components, services, utils)
5. **Maintainable** - Easy to update and refactor
6. **Testable** - Easy to mock for testing
7. **Consistent** - Same pattern as backend
8. **Deep Linking** - Easy to implement
9. **Better DX** - Developer experience improved
10. **Less Bugs** - Type checking prevents common errors
