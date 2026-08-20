import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { User } from "../../../../types";
import { Text, TextInput, Avatar, useTheme } from "react-native-paper";
import commonStyles from "../../../styles/commonStyles";
import { makeEventNotifier } from "../useEventListner";
import ProfilePicture from "../ProfilePicture";

type UserSelectorListProps = {
  route: {
    params: {
      notifyId: string;
      users: User[];
    };
  };
  navigation: NavigationProp<ParamListBase>;
};

const UserSelectorList: React.FC<UserSelectorListProps> = ({ route }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const allUsers = route.params.users || [];

  const notifier = useRef(
    makeEventNotifier<{ user: User }, unknown>(route.params.notifyId),
  ).current;

  const onSelect = (user: User) => {
    notifier.notify({ user });
  };

  const filteredUsers = allUsers.filter((u: User) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for a user..."
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
            <Text style={styles.subheader}>Select User</Text>
            <View style={styles.grid}>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  key={`user-${user.id}`}
                  style={styles.gridItem}
                  onPress={() => onSelect(user)}
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
                  <Text style={styles.gridText} numberOfLines={2}>
                    {user.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {filteredUsers.length === 0 && (
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  gridItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  gridText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
});

export default UserSelectorList;
