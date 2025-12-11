import React, {useState} from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import Button from "../common/Button";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting: boolean;
  title?: string;
}

export const WriteReviewModal = ({visible, onClose, onSubmit, isSubmitting, title = "Viết đánh giá"}: Props) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (comment.trim().length < 5) {
      alert("Vui lòng nhập nội dung đánh giá (tối thiểu 5 ký tự)");
      return;
    }
    onSubmit(rating, comment);
    // Reset form after submit if needed, or handle in parent
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.GRAY} />
                </TouchableOpacity>
              </View>

              {/* Star Selection */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color="#FFB800"
                      style={{marginHorizontal: 4}}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>{rating}/5 Tuyệt vời</Text>

              {/* Comment Input */}
              <TextInput
                style={styles.input}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />

              <Button
                title={isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                onPress={handleSubmit}
                disabled={isSubmitting}
                containerStyle={{marginTop: 10}}
              />
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  ratingLabel: {
    textAlign: "center",
    color: COLORS.GRAY,
    marginBottom: 20,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    height: 100,
    marginBottom: 16,
    fontSize: 15,
  },
});
