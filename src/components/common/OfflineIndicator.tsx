import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { Text, useTheme } from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import { SyncManager, SyncStatus } from "../../offline/SyncManager";
import { OfflineQueue } from "../../offline/OfflineQueue";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OfflineIndicator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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

    const unsubQueue = OfflineQueue.addListener((count) => {
      setQueueCount(count);
    });

    // Check initial queue count
    OfflineQueue.getCount().then(setQueueCount);

    return () => {
      unsubNet();
      unsubSync();
      unsubQueue();
    };
  }, []);

  if (!isOffline && queueCount === 0 && !syncStatus?.isSyncing) return null;

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top ||
            (Platform.OS === "android" ? StatusBar.currentHeight : 0),
        },
      ]}
      pointerEvents="none"
    >
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
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
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
