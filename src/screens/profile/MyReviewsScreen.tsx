import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {apiClient} from "@config/api.client";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";

interface Review {
  id: number;
  type: "restaurant" | "product";
  restaurantId: number;
  restaurantName?: string;
  productId?: number;
  productName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const MyReviewsScreen = ({navigation}: any) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({rating: 5, comment: ""});
  const [updating, setUpdating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [])
  );

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/reviews/user/me");
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditData({rating: review.rating, comment: review.comment});
    setEditModalVisible(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview || !editData.comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    setUpdating(true);
    try {
      await apiClient.put(`/reviews/${editingReview.id}`, editData);
      Alert.alert("Success", "Review updated successfully");
      setEditModalVisible(false);
      loadReviews();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update review");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete Review", `Delete your review for "${name}"?`, [
      {text: "Cancel", style: "cancel"},
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/reviews/${id}`);
            setReviews(reviews.filter((r) => r.id !== id));
            Alert.alert("Success", "Review deleted");
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to delete review");
          }
        },
      },
    ]);
  };

  const renderReview = ({item}: {item: Review}) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewInfo}>
          <Ionicons name={item.type === "restaurant" ? "storefront" : "fast-food"} size={20} color={COLORS.PRIMARY} />
          <View style={styles.reviewTitles}>
            <Text style={styles.reviewName}>{item.type === "restaurant" ? item.restaurantName : item.productName}</Text>
            <Text style={styles.reviewType}>{item.type === "restaurant" ? "Restaurant" : "Product"}</Text>
          </View>
        </View>

        <View style={styles.ratingContainer}>
          {Array.from({length: 5}).map((_, i) => (
            <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={16} color="#FFB800" />
          ))}
        </View>
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>

        <View style={styles.reviewActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
            <Ionicons name="create-outline" size={18} color={COLORS.INFO} />
            <Text style={[styles.actionText, {color: COLORS.INFO}]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id, item.type === "restaurant" ? item.restaurantName! : item.productName!)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
            <Text style={[styles.actionText, {color: COLORS.ERROR}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {reviews.length === 0 ? (
        <EmptyState
          icon="chatbox-outline"
          title="No Reviews Yet"
          subtitle="Start reviewing restaurants and products you've tried"
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
          }
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Review</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>Your Rating</Text>
              <View style={styles.editStars}>
                {Array.from({length: 5}).map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setEditData({...editData, rating: i + 1})}>
                    <Ionicons name={i < editData.rating ? "star" : "star-outline"} size={32} color="#FFB800" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>Your Review</Text>
              <Input
                value={editData.comment}
                onChangeText={(comment) => setEditData({...editData, comment})}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
              />
            </View>

            <Button
              title="Update Review"
              onPress={handleUpdateReview}
              loading={updating}
              containerStyle={styles.updateButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  reviewTitles: {
    flex: 1,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  reviewType: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.DARK,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  editStars: {
    flexDirection: "row",
    gap: 8,
  },
  updateButton: {
    width: "100%",
  },
});

export default MyReviewsScreen;
