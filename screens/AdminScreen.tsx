import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Title, useTheme } from "react-native-paper";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PRIMARY, SECONDARY } from "../src/styles/colors";
import {
  BORDER_RADIUS,
  CONTAINER_PADDING,
  SHADOW,
} from "../src/styles/constants";

type AdminScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

// Modern Dashboard Card Component
const AdminCard = ({
  title,
  icon,
  onPress,
  theme,
  accessibilityLabel,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  theme: {
    colors: {
      surface: string;
      onSurface: string;
      primary: string;
      background: string;
    };
  };
  accessibilityLabel?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}
    accessibilityLabel={accessibilityLabel || title}
    accessibilityRole="button"
    accessibilityHint={`Navigates to ${title}`}
  >
    <View style={styles.cardContent}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.iconContainer}
      >
        <MaterialCommunityIcons
          name={icon}
          size={40}
          color={theme.colors.primary}
        />
      </LinearGradient>
      <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [loggedInUser] = useRecoilState(userState);
  const [impersonate, setImpersonate] = useState<boolean>(false);

  useEffect(() => {
    setImpersonate(loggedInUser.roles.some((role) => role.name === "ADMIN"));
  }, [loggedInUser.roles]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: CONTAINER_PADDING,
          paddingTop: CONTAINER_PADDING + 10,
          backgroundColor: theme.colors.background,
          minHeight: "100%",
        },
      }),
    [theme.colors.background],
  );

  return (
    <ScrollView
      contentContainerStyle={dynamicStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[PRIMARY, SECONDARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Title style={styles.welcomeText}>Admin Panel</Title>
        <Title style={styles.subtitleText}>Manage your business settings</Title>
      </LinearGradient>

      {/* Cards Grid */}
      <View style={styles.cardsContainer}>
        <AdminCard
          title="Manage Roles"
          icon="shield-account"
          theme={theme}
          onPress={() => navigation.navigate("RolesStack", { screen: "Roles" })}
          accessibilityLabel="Manage user roles"
        />

        <AdminCard
          title="Expense Types"
          icon="receipt"
          theme={theme}
          onPress={() =>
            navigation.navigate("ExpenseTypeStack", {
              screen: "ExpenseTypes",
              params: { title: "Expense types" },
            })
          }
          accessibilityLabel="Manage expense types"
        />

        <AdminCard
          title="Manage Tags"
          icon="tag-multiple"
          theme={theme}
          onPress={() => navigation.navigate("TagsStack", { screen: "Tags" })}
          accessibilityLabel="Manage tags"
        />

        <AdminCard
          title="Work Types"
          icon="briefcase-variant"
          theme={theme}
          onPress={() =>
            navigation.navigate("AdminStack", {
              screen: "WorkTypeList",
              params: { title: "Work type" },
            })
          }
          accessibilityLabel="Manage work types"
        />

        <AdminCard
          title="Middle Man"
          icon="account-switch"
          theme={theme}
          onPress={() =>
            navigation.navigate("MiddleManStack", {
              screen: "WorkAndSaleList",
              params: { title: "Work And Sale" },
            })
          }
          accessibilityLabel="Manage middle man work and sales"
        />

        {impersonate && (
          <AdminCard
            title="Impersonate"
            icon="account-convert"
            theme={theme}
            onPress={() =>
              navigation.navigate("HomeStack", {
                screen: "ImpersonationScreen",
                params: { title: "Impersonation User" },
              })
            }
            accessibilityLabel="Impersonate another user"
          />
        )}
      </View>
    </ScrollView>
  );
};

const { width: screenWidth } = Dimensions.get("window");
// 2 columns with padding: (screenWidth - (padding * 3)) / 2
const cardWidth = (screenWidth - CONTAINER_PADDING * 3) / 2;

const styles = StyleSheet.create({
  headerGradient: {
    marginBottom: CONTAINER_PADDING * 1.5,
    padding: CONTAINER_PADDING,
    paddingTop: CONTAINER_PADDING * 2,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: -CONTAINER_PADDING - 10,
    marginHorizontal: -CONTAINER_PADDING,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: CONTAINER_PADDING,
    marginTop: -30,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: CONTAINER_PADDING,
    borderRadius: BORDER_RADIUS,
    ...SHADOW,
    elevation: 4,
  },
  cardContent: {
    alignItems: "center",
    padding: CONTAINER_PADDING,
    justifyContent: "center",
    minHeight: 140,
  },
  iconContainer: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AdminScreen;
