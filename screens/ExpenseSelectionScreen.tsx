import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Avatar, useTheme, Divider } from "react-native-paper";
import { useRecoilValue } from "recoil";
import { usersState, expenseTypesState } from "../recoil/atom";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { User, ExpenseType } from "../types";
import commonStyles from "../src/styles/commonStyles";
import ProfilePicture from "../src/components/common/ProfilePicture";

interface ExpenseSelectionScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const ExpenseSelectionScreen: React.FC<ExpenseSelectionScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const users = useRecoilValue(usersState);
  const expenseTypes = useRecoilValue(expenseTypesState);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u: User) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortOrder = [
    "house expenditure",
    "medical",
    "travel",
    "murgi farm",
    "donation",
    "kids",
    "education",
    "khet",
    "gold renewal",
  ];

  const getSortIndex = (name: string) => {
    const lowerName = name.toLowerCase();
    const index = sortOrder.findIndex((item) => lowerName.includes(item));
    return index !== -1 ? index : sortOrder.length;
  };

  const hiddenExpenseTypes = [
    "others mazori",
    "car loan",
    "past investment",
    "loan emi",
    "bed emi",
    "max life",
  ];

  const filteredExpenseTypes = expenseTypes
    .filter((t: ExpenseType) => {
      const lowerName = t.name.toLowerCase();
      return (
        lowerName.includes(searchQuery.toLowerCase()) &&
        !t.isReceivingUser && // Exclude transfer types from direct expense types list
        !lowerName.includes("transfer") &&
        !hiddenExpenseTypes.some(
          (hidden) => lowerName === hidden || lowerName.includes(hidden),
        )
      );
    })
    .sort(
      (a: ExpenseType, b: ExpenseType) =>
        getSortIndex(a.name) - getSortIndex(b.name),
    );

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getExpenseIconInfo = (name: string) => {
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes("house") ||
      lowerName.includes("home") ||
      lowerName.includes("rent")
    )
      return { icon: "home", color: "#4CAF50" };
    if (
      lowerName.includes("medical") ||
      lowerName.includes("hospital") ||
      lowerName.includes("doctor")
    )
      return { icon: "hospital", color: "#F44336" };
    if (
      lowerName.includes("travel") ||
      lowerName.includes("car") ||
      lowerName.includes("fuel")
    )
      return { icon: "car", color: "#2196F3" };
    if (
      lowerName.includes("donation") ||
      lowerName.includes("charity") ||
      lowerName.includes("zakat")
    )
      return { icon: "hand-heart", color: "#E91E63" };
    if (
      lowerName.includes("food") ||
      lowerName.includes("supari") ||
      lowerName.includes("grocery")
    )
      return { icon: "basket", color: "#FF9800" };
    if (lowerName.includes("gold") || lowerName.includes("jewelry"))
      return { icon: "ring", color: "#FFC107" };
    if (
      lowerName.includes("murgi") ||
      lowerName.includes("chicken") ||
      lowerName.includes("poultry")
    )
      return { icon: "bird", color: "#FF5722" };
    if (
      lowerName.includes("khet") ||
      lowerName.includes("farm") ||
      lowerName.includes("zameen") ||
      lowerName.includes("land")
    )
      return { icon: "sprout", color: "#8BC34A" };
    if (
      lowerName.includes("salary") ||
      lowerName.includes("wage") ||
      lowerName.includes("mazori")
    )
      return { icon: "cash", color: "#009688" };
    if (
      lowerName.includes("education") ||
      lowerName.includes("school") ||
      lowerName.includes("college")
    )
      return { icon: "school", color: "#9C27B0" };
    if (
      lowerName.includes("kid") ||
      lowerName.includes("child") ||
      lowerName.includes("baby")
    )
      return { icon: "human-child", color: "#FF5722" };
    if (
      lowerName.includes("hajj") ||
      lowerName.includes("umrah") ||
      lowerName.includes("mecca")
    )
      return { icon: "mosque", color: "#212121" };

    // Default
    return { icon: "tag", color: theme.colors.primary };
  };

  const navigateToUser = (user: User) => {
    navigation.navigate("UserReport", { userId: user.id, user });
  };

  const navigateToExpenseType = (type: ExpenseType) => {
    navigation.navigate("ExpenseTypeReport", {
      expenseTypeId: type.id,
      expenseTypeName: type.name,
      title: type.name,
    });
  };

  // Chunk users into columns of 2 for a 2-row horizontal layout
  const chunkedUsers: User[][] = [];
  for (let i = 0; i < filteredUsers.length; i += 2) {
    chunkedUsers.push(filteredUsers.slice(i, i + 2));
  }

  const renderUserColumn = ({ item: userColumn }: { item: User[] }) => (
    <View style={styles.userColumn}>
      {userColumn.map((user) => (
        <TouchableOpacity
          key={`user-${user.id}`}
          style={styles.userGridItem}
          onPress={() => navigateToUser(user)}
        >
          {user.picture ? (
            <ProfilePicture
              size={56}
              picture={user.picture}
              style={{ marginBottom: 4 }}
            />
          ) : (
            <Avatar.Text
              size={56}
              label={getInitials(user.name)}
              style={{
                backgroundColor: theme.colors.primaryContainer,
                marginBottom: 4,
              }}
              color={theme.colors.onPrimaryContainer}
            />
          )}
          <Text style={styles.userGridText} numberOfLines={1}>
            {user.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for a user or expense type..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          outlineStyle={{ borderRadius: 24, borderWidth: 0 }}
          dense
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {filteredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Pay a User</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={chunkedUsers}
              renderItem={renderUserColumn}
              keyExtractor={(_, index) => `user-col-${index}`}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {filteredUsers.length > 0 && filteredExpenseTypes.length > 0 && (
          <Divider style={styles.divider} />
        )}

        {filteredExpenseTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Pay for an Expense</Text>
            <View style={styles.expenseGrid}>
              {filteredExpenseTypes.map((item) => {
                const { icon, color } = getExpenseIconInfo(item.name);
                return (
                  <TouchableOpacity
                    key={`type-${item.id}`}
                    style={styles.expenseGridItem}
                    onPress={() => navigateToExpenseType(item)}
                  >
                    <Avatar.Icon
                      size={56}
                      icon={icon}
                      style={{ backgroundColor: `${color}20` }}
                      color={color}
                    />
                    <Text style={styles.expenseGridText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {filteredUsers.length === 0 && filteredExpenseTypes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.outline }}>
              No results found
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: "transparent",
  },
  searchInput: {
    // Removed hardcoded background color
  },
  section: {
    paddingVertical: 8,
  },
  subheader: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userColumn: {
    flexDirection: "column",
    marginRight: 16,
  },
  userGridItem: {
    alignItems: "center",
    width: 72,
    marginBottom: 16,
  },
  userGridText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
  expenseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  expenseGridItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  expenseGridText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
});

export default ExpenseSelectionScreen;
