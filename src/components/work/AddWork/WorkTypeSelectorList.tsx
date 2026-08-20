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
import { WorkType } from "../../../../types";
import { useRecoilValue } from "recoil";
import { workTypesState } from "../../../../recoil/atom";
import {
  Text,
  TextInput,
  Avatar,
  useTheme,
  IconButton,
} from "react-native-paper";
import commonStyles from "../../../styles/commonStyles";
import { makeEventNotifier } from "../../common/useEventListner";

type WorkTypeScreenProps = {
  route: {
    params: {
      typeSelectedNotifier: string;
      attendanceTypeNotifier: string;
    };
  };
  navigation: NavigationProp<ParamListBase>;
};

const WorkTypeSelectorList: React.FC<WorkTypeScreenProps> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const workTypes = useRecoilValue(workTypesState);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    navigation.setOptions({ title: "Select Work Type" });
  }, [navigation]);

  const typeSelectedNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      route.params.typeSelectedNotifier,
    ),
  ).current;
  const attendanceTypeNotifier = useRef(
    makeEventNotifier<{ workType: WorkType }, unknown>(
      route.params.attendanceTypeNotifier,
    ),
  ).current;

  const onPress = (workType: WorkType) => {
    typeSelectedNotifier.notify({ workType });
  };

  const onAttendance = (workType: WorkType) => {
    attendanceTypeNotifier.notify({ workType });
  };

  const getWorkTypeIconInfo = (name: string) => {
    const lowerName = name.toLowerCase();

    // Explicit user requested icons
    if (lowerName.includes("chune so"))
      return { icon: "hand-front-right", color: "#FF9800" };
    if (lowerName.includes("supari mazori"))
      return { icon: "account-hard-hat", color: "#795548" };
    if (
      lowerName.includes("tractor supari chitte") ||
      lowerName.includes("chitte")
    )
      return { icon: "leaf", color: "#4CAF50" };

    // General matchers
    if (lowerName.includes("keni") || lowerName.includes("farm"))
      return { icon: "sprout", color: "#8BC34A" };
    if (lowerName.includes("investment") || lowerName.includes("loan"))
      return { icon: "cash", color: "#009688" };
    if (
      lowerName.includes("tempo") ||
      lowerName.includes("bhada") ||
      lowerName.includes("truck") ||
      lowerName.includes("tractor") ||
      lowerName.includes("tracter")
    )
      return { icon: "tractor", color: "#2196F3" };
    if (lowerName.includes("chile") || lowerName.includes("chili"))
      return { icon: "chili-hot", color: "#F44336" };
    if (lowerName.includes("machine") || lowerName.includes("factory"))
      return { icon: "cogs", color: "#9C27B0" };
    if (lowerName.includes("supari") || lowerName.includes("food"))
      return { icon: "basket", color: "#FF9800" };
    if (lowerName.includes("gold")) return { icon: "ring", color: "#FFC107" };
    if (lowerName.includes("24"))
      return { icon: "numeric-24-box", color: "#3F51B5" };

    // Default
    return { icon: "briefcase", color: theme.colors.primary };
  };

  const getSortIndex = (name: string) => {
    const lowerName = name.trim().toLowerCase();

    // Exact matches for the TOP
    if (lowerName.includes("chile so 24")) return 1;
    if (lowerName === "chune so") return 2;
    if (lowerName === "supari mazori") return 3;
    if (lowerName === "tracter" || lowerName === "tractor") return 4;
    if (lowerName === "keni") return 5;
    if (lowerName === "supari machine") return 6;
    if (lowerName === "supari machine chilne") return 7;
    if (lowerName.toLowerCase().includes("chitte tracter")) return 8;
    if (lowerName.toLowerCase().includes("rashi chune so")) return 9;

    // Exact matches for the END
    if (lowerName === "tractor supari chitte") return 101;
    if (lowerName === "gorbal chune so") return 102;
    if (lowerName === "chile so") return 103;
    if (lowerName.toLowerCase().includes("past")) return 104;

    return 50; // Default for items not explicitly listed
  };

  const filteredWorkTypes = workTypes
    .filter((t: WorkType) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort(
      (a: WorkType, b: WorkType) => getSortIndex(a.name) - getSortIndex(b.name),
    );

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for a work type..."
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
        {filteredWorkTypes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.grid}>
              {filteredWorkTypes.map((item) => {
                const { icon, color } = getWorkTypeIconInfo(item.name);
                return (
                  <TouchableOpacity
                    key={`type-${item.id}`}
                    style={styles.gridItem}
                    onPress={() => onPress(item)}
                  >
                    <View>
                      <Avatar.Icon
                        size={56}
                        icon={icon}
                        style={{ backgroundColor: `${color}20` }}
                        color={color}
                      />
                      {item.name === "Supari mazori" && (
                        <IconButton
                          icon="calendar-check"
                          size={16}
                          iconColor={theme.colors.onPrimary}
                          containerColor={theme.colors.primary}
                          style={styles.attendanceIcon}
                          onPress={(e) => {
                            e.stopPropagation();
                            onAttendance(item);
                          }}
                        />
                      )}
                    </View>
                    <Text style={styles.gridText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {filteredWorkTypes.length === 0 && (
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
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  attendanceIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    margin: 0,
    width: 24,
    height: 24,
  },
});

export default WorkTypeSelectorList;
