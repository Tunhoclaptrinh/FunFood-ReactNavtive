/**
 * Shipper Dashboard
 * Thống kê earnings, deliveries, ratings
 */

import React, {useEffect, useState} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ShipperService, ShipperStats} from "@services/shipper.service";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@config/constants";

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
}

const ShipperDashboardScreen = ({navigation}: any) => {
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs: DashboardTab[] = [
    {id: "overview", label: "Overview", icon: "home-outline"},
    {id: "earnings", label: "Earnings", icon: "cash-outline"},
    {id: "performance", label: "Performance", icon: "stats-chart-outline"},
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await ShipperService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
        <Button title="Retry" onPress={loadStats} style={{marginTop: 16}} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your Performance Today</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as any} size={20} color={activeTab === tab.id ? COLORS.PRIMARY : COLORS.GRAY} />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            {/* Today's Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Summary</Text>

              <View style={styles.statsGrid}>
                {/* Deliveries Today */}
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, {backgroundColor: "#E3F2FD"}]}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#1976D2" />
                  </View>
                  <Text style={styles.statValue}>{stats.deliveredToday}</Text>
                  <Text style={styles.statLabel}>Delivered Today</Text>
                </View>

                {/* Active Deliveries */}
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, {backgroundColor: "#FFF3E0"}]}>
                    <Ionicons name="car-outline" size={24} color="#F57C00" />
                  </View>
                  <Text style={styles.statValue}>{stats.deliveringOrders}</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>

                {/* Total Orders */}
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, {backgroundColor: "#F3E5F5"}]}>
                    <Ionicons name="layers-outline" size={24} color="#7B1FA2" />
                  </View>
                  <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>

                {/* Rating */}
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, {backgroundColor: "#FCE4EC"}]}>
                    <Ionicons name="star" size={24} color="#C2185B" />
                  </View>
                  <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
              </View>
            </View>

            {/* Today's Earnings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earnings</Text>
              <View style={styles.earningsCard}>
                <View>
                  <Text style={styles.earningsLabel}>Today</Text>
                  <Text style={styles.earningsAmount}>{formatCurrency(stats.todayEarnings)}</Text>
                </View>
                <View style={styles.earningsDivider} />
                <View style={styles.earningsTotal}>
                  <Text style={styles.earningsLabel}>Total</Text>
                  <Text style={styles.earningsAmount}>{formatCurrency(stats.totalEarnings)}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Button
                  title="Available Orders"
                  onPress={() => navigation.navigate("ShipperAvailableOrders")}
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="My Deliveries"
                  onPress={() => navigation.navigate("ShipperDeliveries")}
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="History"
                  onPress={() => navigation.navigate("ShipperHistory")}
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Profile"
                  onPress={() => navigation.navigate("Profile")}
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            </View>
          </View>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earnings Summary</Text>

              <View style={styles.earningsDetails}>
                <View style={styles.earningsRow}>
                  <View>
                    <Text style={styles.earningsLabel}>Today's Earnings</Text>
                    <Text style={styles.earningsValue}>{formatCurrency(stats.todayEarnings)}</Text>
                  </View>
                  <View style={{width: 1, backgroundColor: COLORS.LIGHT_GRAY}} />
                  <View style={{flex: 1, paddingLeft: 16}}>
                    <Text style={styles.earningsLabel}>Completed Deliveries</Text>
                    <Text style={styles.earningsValue}>{stats.deliveredToday}</Text>
                  </View>
                </View>

                <View style={styles.earningsRow}>
                  <View>
                    <Text style={styles.earningsLabel}>Average per Delivery</Text>
                    <Text style={styles.earningsValue}>
                      {stats.deliveredToday > 0
                        ? formatCurrency(stats.todayEarnings / stats.deliveredToday)
                        : formatCurrency(0)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total Earnings</Text>
                <View style={styles.totalEarningsCard}>
                  <Text style={styles.totalEarningsLabel}>Lifetime Earnings</Text>
                  <Text style={styles.totalEarningsAmount}>{formatCurrency(stats.totalEarnings)}</Text>
                  <Text style={styles.totalEarningsSubtext}>From {stats.totalOrders} deliveries</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
                <Text style={styles.infoText}>
                  You earn 80% of delivery fees. The remaining 20% goes to operational costs.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Performance</Text>

              <View style={styles.performanceCards}>
                <View style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <Text style={styles.performanceLabel}>Average Delivery Time</Text>
                    <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                  </View>
                  <Text style={styles.performanceValue}>{stats.averageDeliveryTime}</Text>
                  <Text style={styles.performanceSubtext}>minutes</Text>
                </View>

                <View style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <Text style={styles.performanceLabel}>Customer Rating</Text>
                    <Ionicons name="star" size={20} color="#FFB800" />
                  </View>
                  <Text style={styles.performanceValue}>{stats.averageRating.toFixed(1)}</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({length: 5}).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < Math.round(stats.averageRating) ? "star" : "star-outline"}
                        size={14}
                        color="#FFB800"
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <Text style={styles.performanceLabel}>Completion Rate</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.SUCCESS} />
                  </View>
                  <Text style={styles.performanceValue}>100%</Text>
                  <Text style={styles.performanceSubtext}>All orders completed</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tips for Better Performance</Text>
                <View style={styles.tipsList}>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.tipText}>Accept orders quickly to increase reliability</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.tipText}>Complete deliveries on time</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.tipText}>Keep your delivery address accurate</Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.tipText}>Maintain professional communication</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: COLORS.PRIMARY,
  },
  tabContent: {
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.GRAY,
    textAlign: "center",
  },
  earningsCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earningsLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  earningsDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  earningsTotal: {
    alignItems: "flex-end",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
  },
  earningsDetails: {
    gap: 12,
  },
  earningsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  totalEarningsCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  totalEarningsLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  totalEarningsAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginVertical: 8,
  },
  totalEarningsSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.INFO,
    lineHeight: 18,
  },
  performanceCards: {
    gap: 12,
  },
  performanceCard: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 6,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.DARK,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ShipperDashboardScreen;
