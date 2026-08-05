import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import { SyncManager, SyncStatus } from "../../offline/SyncManager";
import { OfflineQueue } from "../../offline/OfflineQueue";

const OfflineIndicator = () => {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    const unsubSync = SyncManager.addListener((status) => {
      setSyncStatus(status);
      OfflineQueue.getCount().then(setQueueCount);
    });

    // Check initial queue count
    OfflineQueue.getCount().then(setQueueCount);

    return () => {
      unsubNet();
      unsubSync();
    };
  }, []);

  if (!isOffline && queueCount === 0 && !syncStatus?.isSyncing) return null;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: isOffline
              ? theme.colors.errorContainer
              : theme.colors.tertiaryContainer,
          },
        ]}
      >
        {isOffline && (
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onErrorContainer }}
          >
            📴 Offline Mode — {queueCount} items queued
          </Text>
        )}
        {syncStatus?.isSyncing && (
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onTertiaryContainer }}
          >
            🔄 Syncing... {syncStatus.completed}/{syncStatus.total}
            {syncStatus.currentItem ? ` (${syncStatus.currentItem})` : ""}
          </Text>
        )}
        {!isOffline && queueCount > 0 && !syncStatus?.isSyncing && (
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onTertiaryContainer }}
          >
            ⏳ {queueCount} items pending sync
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : 0, // Fallback if safe area fails, but top: 0 usually works for absolute positioning when we want to overlay.
    left: 0,
    right: 0,
    zIndex: 9999, // Ensure it overlays everything globally
    elevation: 9999,
  },
  container: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});

export default OfflineIndicator;
