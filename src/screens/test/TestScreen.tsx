import React, {useState} from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {restaurantApi} from "@api/restaurant.api";
import {authApi} from "@api/auth.api";

export const TestScreen = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testApi = async (fn: () => Promise<any>, name: string) => {
    setLoading(true);
    setResult(`Testing: ${name}...`);
    try {
      const res = await fn();
      setResult(`✅ ${name}:\n${JSON.stringify(res.data, null, 2)}`);
    } catch (err: any) {
      setResult(`❌ ${name}:\n${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 API Test</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testApi(() => restaurantApi.getAll({_limit: 5}), "Get Restaurants")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test: Get Restaurants</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testApi(() => restaurantApi.getById(1), "Get Restaurant Detail")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test: Get Restaurant #1</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testApi(() => restaurantApi.getNearby(10.7756, 106.7019, 5), "Get Nearby")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test: Get Nearby Restaurants</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testApi(() => authApi.login({email: "user@funfood.com", password: "123456"}), "Login")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test: Login</Text>
      </TouchableOpacity>

      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  result: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontFamily: "Courier",
    fontSize: 12,
  },
});
