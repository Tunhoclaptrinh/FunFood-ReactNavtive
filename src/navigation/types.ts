export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  RestaurantDetail: {restaurantId: number};
  ProductDetail: {productId: number};
  OrderDetail: {orderId: number};
  Checkout: undefined;
};
