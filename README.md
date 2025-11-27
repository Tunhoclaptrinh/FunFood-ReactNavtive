# 🍔 FunFood Mobile - Food Delivery App

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Base Architecture](#base-architecture)
- [Core Features](#core-features)
- [Getting Started](#getting-started)
- [Component Documentation](#component-documentation)
- [Services Documentation](#services-documentation)
- [State Management](#state-management)
- [Navigation System](#navigation-system)

---

## 🎯 Overview

FunFood là ứng dụng đặt đồ ăn trực tuyến được xây dựng với React Native và Expo. Ứng dụng hỗ trợ đa vai trò (Customer, Shipper, Admin) với kiến trúc base components có thể tái sử dụng.

### Key Highlights

- ✅ **Type-Safe**: Full TypeScript integration
- ✅ **Modular Architecture**: Base components & services pattern
- ✅ **Scalable**: Easy to extend with new features
- ✅ **Clean Code**: Following SOLID principles
- ✅ **Multi-Role Support**: Customer, Shipper, Admin flows

---

## 🛠 Tech Stack

### Core

- **React Native 0.81.5** - Mobile framework
- **Expo 54** - Development platform
- **TypeScript 5.9** - Type safety

### Navigation

- **React Navigation 7** - Navigation library
- **Bottom Tabs** - Main navigation
- **Native Stack** - Screen transitions

### State Management

- **Zustand 5** - Lightweight state management
- **React Hooks** - Component state

### Networking

- **Axios 1.13** - HTTP client
- **Custom API Client** - Interceptors & error handling

### Maps & Location

- **React Native Maps** - Map integration
- **Expo Location** - GPS services
- **Google Directions API** - Route planning

### UI Components

- **React Native Gesture Handler** - Touch interactions
- **Expo Vector Icons** - Icon library
- **Expo Linear Gradient** - Gradient backgrounds
- **Custom Base Components** - Reusable UI library

---

## 📁 Project Structure

```
funfood-mobile/
├── assets/                          # Static assets
│   ├── funfood-logo/               # App logos
│   ├── icon.png                    # App icon
│   └── splash-icon.png             # Splash screen
│
├── src/
│   ├── base/                       # 🔥 BASE ARCHITECTURE
│   │   ├── BaseApiService.ts       # API service base class
│   │   ├── BaseStore.ts            # Zustand store factory
│   │   ├── BaseRepository.ts       # In-memory data management
│   │   ├── useApi.ts               # API hooks (useApi, useMutation, useQuery)
│   │   └── index.ts                # Base exports
│   │
│   ├── components/                 # 🎨 UI COMPONENTS
│   │   ├── common/                 # Reusable components
│   │   │   ├── BaseList/           # List with pagination & filters
│   │   │   ├── Button/             # Button component
│   │   │   ├── Card/               # Card component
│   │   │   ├── EmptyState/         # Empty state UI
│   │   │   ├── Input/              # Input component
│   │   │   ├── Loading/            # Loading indicator
│   │   │   ├── MapView/            # Google Maps wrapper
│   │   │   └── SearchBar/          # Search input
│   │   └── [feature]/              # Feature-specific components
│   │
│   ├── config/                     # ⚙️ CONFIGURATION
│   │   ├── api.client.ts           # Axios instance & interceptors
│   │   ├── api.config.ts           # API endpoints
│   │   ├── routes.config.ts        # Navigation routes
│   │   ├── constants.ts            # App constants
│   │   └── env.ts                  # Environment config
│   │
│   ├── hooks/                      # 🎣 CUSTOM HOOKS
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useCart.ts              # Cart management
│   │   ├── useDebounce.ts          # Debounce hook
│   │   ├── useGeolocation.ts       # GPS location
│   │   └── useNavigation.ts        # Navigation wrapper
│   │
│   ├── navigation/                 # 🧭 NAVIGATION
│   │   ├── RootNavigator.tsx       # Root navigation logic
│   │   ├── MainNavigator.tsx       # Customer flow
│   │   ├── AuthNavigator.tsx       # Auth flow
│   │   ├── ShipperNavigator.tsx    # Shipper flow
│   │   └── index.ts                # Navigation exports
│   │
│   ├── screens/                    # 📱 SCREENS
│   │   ├── auth/                   # Login, Register
│   │   ├── home/                   # Home, Restaurant Detail, Product Detail
│   │   ├── search/                 # Search screen
│   │   ├── cart/                   # Cart, Checkout
│   │   ├── orders/                 # Orders, Order Detail
│   │   ├── profile/                # Profile & settings
│   │   └── shipper/                # Shipper screens
│   │
│   ├── services/                   # 🔌 API SERVICES
│   │   ├── auth.service.ts         # Authentication
│   │   ├── restaurant.service.ts   # Restaurants
│   │   ├── product.service.ts      # Products
│   │   ├── order.service.ts        # Orders
│   │   ├── cart.service.ts         # Cart
│   │   ├── favorite.service.ts     # Favorites
│   │   ├── review.service.ts       # Reviews
│   │   ├── promotion.service.ts    # Promotions
│   │   ├── map.service.ts          # Maps & GPS
│   │   ├── shipper.service.ts      # Shipper operations
│   │   └── index.ts                # Services exports
│   │
│   ├── stores/                     # 📦 STATE MANAGEMENT
│   │   ├── authStore.ts            # Auth state
│   │   ├── appStore.ts             # Cart state
│   │   ├── restaurantStore.ts      # Restaurants state
│   │   ├── productStore.ts         # Products state
│   │   └── notificationStore.ts    # Notifications state
│   │
│   ├── styles/                     # 🎨 STYLING
│   │   ├── colors.ts               # Color palette
│   │   ├── spacing.ts              # Spacing constants
│   │   ├── fonts.ts                # Typography
│   │   └── commonStyles.ts         # Common styles
│   │
│   ├── types/                      # 📝 TYPE DEFINITIONS
│   │   ├── user.ts                 # User types
│   │   ├── restaurant.ts           # Restaurant types
│   │   ├── product.ts              # Product types
│   │   ├── order.ts                # Order types
│   │   ├── cart.ts                 # Cart types
│   │   └── index.ts                # Type exports
│   │
│   ├── utils/                      # 🛠 UTILITIES
│   │   ├── formatters.ts           # Format helpers
│   │   ├── validation.ts           # Validation helpers
│   │   ├── gps.ts                  # GPS calculations
│   │   ├── storage.ts              # AsyncStorage wrapper
│   │   └── logger.ts               # Logging utility
│   │
│   └── App.tsx                     # App entry point
│
├── App.tsx                         # Root component
├── index.ts                        # App registration
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── babel.config.js                 # Babel config
```

---

## 🏗 Base Architecture

### 1. BaseApiService

Base class cho tất cả API services với các tính năng:

**Features:**

- ✅ CRUD operations (getAll, getById, create, update, delete)
- ✅ Pagination support (\_page, \_limit)
- ✅ Sorting (\_sort, \_order)
- ✅ Advanced filtering (field_gte, field_lte, field_ne, field_like, field_in)
- ✅ Full-text search (q parameter)
- ✅ Relationships (\_embed, \_expand)
- ✅ Batch operations (batchDelete, batchCreate, batchUpdate)
- ✅ Utility methods (exists, count)

**Usage Example:**

```typescript
// Define service
class RestaurantService extends BaseApiService<Restaurant> {
  protected baseEndpoint = "/restaurants";
}

// Use in components
const restaurants = await restaurantService.getAll({
  page: 1,
  limit: 10,
  sort: "rating",
  order: "desc",
});

// Advanced filtering
const filtered = await restaurantService.filter({
  rating_gte: 4.5,
  isOpen: true,
  categoryId: 1,
});

// Search
const results = await restaurantService.search("pizza");
```

### 2. BaseStore (Zustand Factory)

Factory function tạo Zustand stores với đầy đủ tính năng:

**Features:**

- ✅ Pagination with infinite scroll
- ✅ Pull-to-refresh
- ✅ Search & filtering
- ✅ Sorting
- ✅ Loading states (isLoading, isRefreshing, isLoadingMore)
- ✅ Error handling
- ✅ Data mutations (add, update, remove)
- ✅ Auto-fetch on mount

**Usage Example:**

```typescript
// Create store
export const useRestaurantStore = createBaseStore<Restaurant>(RestaurantService, "restaurants", {
  pageSize: 20,
  initialSort: {field: "rating", order: "desc"},
});

// Use in component
const {items, isLoading, fetchAll, search, setFilters, applyFilters} = useRestaurantStore();

// Fetch data
useEffect(() => {
  fetchAll();
}, []);

// Search
search("pizza");

// Filter
setFilters({categoryId: 1, isOpen: true});
applyFilters();
```

### 3. useApi Hook

Powerful hook for API calls với advanced features:

**Features:**

- ✅ Loading, error, success states
- ✅ Request cancellation
- ✅ Memory leak prevention
- ✅ Callbacks (onSuccess, onError, onSettled)
- ✅ Auto-execute on mount
- ✅ Manual execute

**Usage Example:**

```typescript
// Basic usage
const {data, loading, error, execute} = useApi(restaurantService.getNearby);

// With callbacks
const {data, execute} = useApi(restaurantService.getNearby, {
  onSuccess: (data) => console.log("Loaded:", data),
  onError: (error) => console.error("Error:", error),
});

// Auto execute
const {data, loading} = useApi(restaurantService.getAll, {
  immediate: true,
  immediateArgs: [{page: 1, limit: 10}],
});
```

### 4. BaseList Component

Advanced list component với full features:

**Features:**

- ✅ Skeleton loading
- ✅ Pull-to-refresh
- ✅ Infinite scroll
- ✅ Empty state with actions
- ✅ Error state with retry
- ✅ Auto-fetch on mount

**Usage Example:**

```typescript
<BaseList
  items={items}
  isLoading={isLoading}
  isRefreshing={isRefreshing}
  isLoadingMore={isLoadingMore}
  error={error}
  hasMore={hasMore}
  fetchAll={fetchAll}
  fetchMore={fetchMore}
  refresh={refresh}
  renderItem={(item) => <RestaurantCard restaurant={item} />}
  keyExtractor={(item) => item.id.toString()}
  emptyTitle="No restaurants found"
  emptyAction={{
    label: "Explore",
    onPress: () => navigation.navigate("Home"),
  }}
  renderSkeleton={() => <RestaurantCardSkeleton />}
/>
```

---

## 🎨 Core Features

### 1. Authentication System

**Components:**

- `LoginScreen.tsx` - User login
- `RegisterScreen.tsx` - User registration
- `useAuth.ts` - Authentication hook
- `authStore.ts` - Auth state management

**Features:**

- Email/password authentication
- Token-based auth with JWT
- Automatic session restoration
- Role-based access (Customer, Shipper, Admin)
- Secure token storage

### 2. Restaurant Discovery

**Components:**

- `HomeScreen.tsx` - Browse restaurants
- `RestaurantDetailScreen.tsx` - Menu & details
- `SearchScreen.tsx` - Search functionality

**Features:**

- GPS-based nearby search
- Category filtering
- Rating & price filters
- Real-time availability status
- Advanced search with autocomplete

### 3. Product & Menu

**Components:**

- `ProductDetailScreen.tsx` - Product information
- `RestaurantMenu` - Restaurant products

**Features:**

- Detailed product information
- Pricing with discounts
- Reviews & ratings
- Add to cart functionality
- Product availability status

### 4. Shopping Cart

**Components:**

- `CartScreen.tsx` - View cart
- `CheckoutScreen.tsx` - Place order

**Features:**

- Add/remove/update items
- Quantity management
- Real-time price calculation
- Promotion code support
- Multiple payment methods

### 5. Order Management

**Components:**

- `OrdersScreen.tsx` - Order history
- `OrderDetailScreen.tsx` - Order tracking

**Features:**

- Order status tracking
- Real-time updates
- Order rating & review
- Reorder functionality
- Cancel order support

### 6. Maps & Navigation

**Components:**

- `MapView` - Custom map component
- `map.service.ts` - GPS utilities

**Features:**

- Google Maps integration
- GPS location tracking
- Route planning with directions
- Distance calculation
- Real-time location updates
- Long-press to select destination

### 7. Shipper Flow

**Screens:**

- `ShipperDashboardScreen` - Stats & overview
- `ShipperAvailableOrdersScreen` - Accept orders
- `ShipperDeliveriesScreen` - Active deliveries
- `ShipperHistoryScreen` - Completed orders

**Features:**

- Accept available orders
- Update delivery status
- Track earnings & statistics
- View delivery history
- Route optimization

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli
```

### Installation

1. **Clone repository**

```bash
git clone https://github.com/your-repo/funfood-mobile.git
cd funfood-mobile
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. **Start development server**

```bash
npm start
```

5. **Run on device/emulator**

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 📚 Component Documentation

### Common Components

#### Button

```typescript
<Button
  title="Click Me"
  onPress={handlePress}
  variant="primary" // primary | secondary | outline | ghost | danger
  size="medium" // small | medium | large
  loading={false}
  disabled={false}
  leftIcon="home-outline"
  rightIcon="arrow-forward"
  fullWidth={true}
/>
```

#### Input

```typescript
<Input
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  secureTextEntry={false}
  error={errors.email}
  leftIcon="mail-outline"
  required={true}
  maxLength={100}
/>
```

#### Card

```typescript
<Card
  image="https://..."
  title="Restaurant Name"
  subtitle="Italian Cuisine"
  description="Best pasta in town"
  rating={4.5}
  badge="New"
  footer={<PriceInfo />}
  onPress={handlePress}
  variant="default" // default | horizontal | minimal
/>
```

#### EmptyState

```typescript
<EmptyState
  icon="search-outline"
  title="No results found"
  subtitle="Try different keywords"
  primaryAction={{
    label: "Retry",
    onPress: handleRetry,
  }}
  variant="default" // default | error | search | loading
/>
```

#### SearchBar

```typescript
<SearchBar
  value={query}
  onChangeText={setQuery}
  onClear={handleClear}
  onSubmit={handleSubmit}
  placeholder="Search..."
  debounceDelay={300}
  size="medium"
  searchMode="both" // onChange | onSubmit | both
/>
```

---

## 🔌 Services Documentation

### RestaurantService

```typescript
// Get all restaurants
const restaurants = await RestaurantService.getAll({
  page: 1,
  limit: 10,
});

// Get nearby restaurants
const nearby = await RestaurantService.getNearby({
  latitude: 10.7756,
  longitude: 106.7019,
  radius: 5,
  isOpen: true,
});

// Search restaurants
const results = await RestaurantService.search("pizza");

// Get restaurant menu
const menu = await RestaurantService.getMenu(restaurantId);

// Filter restaurants
const filtered = await RestaurantService.filter({
  categoryId: 1,
  rating_gte: 4.5,
  isOpen: true,
});
```

### ProductService

```typescript
// Get products
const products = await ProductService.getAll();

// Get discounted products
const deals = await ProductService.getDiscounted();

// Get by restaurant
const menu = await ProductService.getByRestaurant(restaurantId);

// Filter by price
const affordable = await ProductService.getByPriceRange(10000, 50000);
```

### OrderService

```typescript
// Create order
const order = await OrderService.createOrder({
  restaurantId: 1,
  items: [{productId: 1, quantity: 2}],
  deliveryAddress: "123 Main St",
  paymentMethod: "cash",
});

// Get orders
const orders = await OrderService.getOrders(1, 10);

// Cancel order
await OrderService.cancelOrder(orderId);

// Rate order
await OrderService.rateOrder(orderId, 5, "Great food!");
```

---

## 📦 State Management

### Auth Store

```typescript
const {user, token, isAuthenticated, isLoading, setUser, logout, restoreSession} = useAuthStore();
```

### Cart Store

```typescript
const {items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart} = useCartStore();
```

### Restaurant Store

```typescript
const {items, isLoading, error, fetchAll, search, setFilters, applyFilters, refresh} = useRestaurantStore();
```

---

## 🧭 Navigation System

### Centralized Routes

```typescript
import {ROUTE_NAMES} from "@/src/config/routes.config";

// Navigate to screens
navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {
  restaurantId: 1,
});
```

### Navigation Service

```typescript
import {NavigationService} from "@/src/services/navigation.service";

// Navigate from anywhere (services, utils)
NavigationService.toRestaurantDetail(1);
NavigationService.toCart();
NavigationService.toLogin();
```

### useNavigation Hook

```typescript
const navigation = useNavigation();

// All navigation methods available
navigation.toHome();
navigation.toRestaurantDetail(restaurantId);
navigation.goBack();
```

---

## 🎯 Best Practices

### 1. Use Base Components

```typescript
// ❌ Don't create new components for common UI
const MyButton = () => <TouchableOpacity>...</TouchableOpacity>

// ✅ Use base components
<Button title="Click" onPress={handlePress} />
```

### 2. Leverage Base Services

```typescript
// ❌ Don't write custom API logic
const fetchData = async () => {
  const response = await fetch("/api/restaurants");
  return response.json();
};

// ✅ Extend BaseApiService
class RestaurantService extends BaseApiService<Restaurant> {
  protected baseEndpoint = "/restaurants";
}
```

### 3. Use Type-Safe Navigation

```typescript
// ❌ String literals
navigation.navigate("RestaurantDetail", {id: 1});

// ✅ Type-safe constants
navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {
  restaurantId: 1,
});
```

### 4. Consistent Error Handling

```typescript
try {
  await orderService.createOrder(data);
} catch (error) {
  // Always show user-friendly messages
  Alert.alert("Error", error.response?.data?.message || "Failed to create order");
}
```

---

## 🔧 Configuration

### API Endpoints

Edit `src/config/api.config.ts`

### App Constants

Edit `src/config/constants.ts`

### Color Scheme

Edit `src/styles/colors.ts`

### Navigation Routes

Edit `src/config/routes.config.ts`

---

<!-- ## 📄 License -->

<!-- MIT License - see LICENSE file for details -->

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

<!--
## 📞 Support

For support, email: support@funfood.com (Fake!) -->

---

**Built with ❤️ by FunFood Team**
