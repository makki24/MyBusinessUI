import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { userState, worksState } from "../recoil/atom";
import WorkService from "../services/WorkService";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import {
  IconButton,
  Text,
  TextInput,
  useTheme,
  Button,
} from "react-native-paper";
import Loading from "../src/components/common/Loading";
import { UI_ELEMENTS_GAP, BORDER_RADIUS } from "../src/styles/constants";
import { REPORT_BACKGROUND_COLOR } from "../src/styles/colors";
import { User, Work, WorkType } from "../types";
import ConfirmationModal from "../components/common/ConfirmationModal";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import UserDetails from "../components/common/UserDetails";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card } from "react-native-paper";

const WorkChatBubble = ({
  work,
  onEdit,
  onDelete,
}: {
  work: Work;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: UI_ELEMENTS_GAP,
        flexDirection: "row",
        paddingHorizontal: UI_ELEMENTS_GAP,
      }}
    >
      <TouchableOpacity
        onPress={onEdit}
        onLongPress={onDelete}
        activeOpacity={0.8}
      >
        <Card
          style={{
            minWidth: "70%",
            maxWidth: "90%",
            borderTopLeftRadius: 0,
            backgroundColor: theme.colors.surfaceVariant,
          }}
        >
          <Card.Content style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: "bold",
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                ₹{work.amount}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, opacity: 0.8 }}
              >
                {work.quantity} {work.type.unit || "units"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {work.type.name}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}
              >
                {new Date(work.date).toDateString()}
              </Text>
            </View>
            {work.description ? (
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                  fontStyle: "italic",
                }}
              >
                {work.description}
              </Text>
            ) : null}
            <View
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: "rgba(0,0,0,0.06)",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                variant="bodySmall"
                style={{
                  fontWeight: "600",
                  opacity: 0.7,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                @ ₹{work.pricePerUnit} / unit
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

interface WorkLedgerScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: {
    params: {
      workType: WorkType;
      user: User;
    };
  };
}

const WorkLedgerScreen: React.FC<WorkLedgerScreenProps> = ({
  navigation,
  route,
}) => {
  const { workType, user } = route.params;

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const setGlobalWorks = useSetRecoilState(worksState);

  const [ledgerWorks, setLedgerWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 15;

  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showAllWorks, setShowAllWorks] = useState(!user.lastSettlementDate);

  const fetchWorks = async (reset = false) => {
    setError("");
    try {
      if (isRefreshing) return;

      if (reset) {
        setOffset(0);
        setHasMore(true);
      } else if (!hasMore) {
        return;
      }

      setIsRefreshing(true);
      const currentOffset = reset ? 0 : offset;

      const filterPayload: Record<string, unknown> = {
        user: [user],
        sender: [],
        receiver: [],
        tags: [],
      };

      if (!showAllWorks && user.lastSettlementDate) {
        filterPayload.fromDate = user.lastSettlementDate;
      }

      const worksData = await WorkService.filterWork({
        filter: filterPayload,
        sort: [{ property: "date", direction: "desc" }],
        offset: currentOffset,
        limit: limit,
      });

      const formattedData = worksData.map((work) => ({
        ...work,
        date: new Date(work.date),
      }));

      if (worksData.length < limit) {
        setHasMore(false);
      }

      if (reset) {
        setLedgerWorks(formattedData);
      } else {
        setLedgerWorks((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = formattedData.filter((d) => !existingIds.has(d.id));
          return [...prev, ...newUnique];
        });
      }

      setOffset(currentOffset + limit);
    } catch (fetchError) {
      setError(
        fetchError.message || "Error fetching work history. Please try again.",
      );
      setHasMore(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorks(true);
  }, [showAllWorks]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    setError(null);
    setIsSending(true);
    Keyboard.dismiss();

    try {
      const parsedQuantity = parseFloat(quantity);
      const price = workType.pricePerUnit || 0;
      const computedAmount = parsedQuantity * price;

      const newWork: Work = {
        date: new Date(),
        type: workType,
        quantity: parsedQuantity,
        pricePerUnit: price,
        amount: computedAmount,
        description: description || undefined,
        user: user,
        tags: workType.defaultTags ? [...workType.defaultTags] : [],
      };

      const savedWork = await WorkService.addWork(newWork);
      savedWork.date = new Date(savedWork.date);

      setQuantity("");
      setDescription("");
      setShowMessage(false);

      setLedgerWorks((prev) => [savedWork, ...prev]);

      setGlobalWorks((prev) => [savedWork, ...prev]);
    } catch (err) {
      setError(
        err.response?.data ??
          err.message ??
          "An error occurred while saving the work",
      );
    } finally {
      setIsSending(false);
    }
  };

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const handleEditWork = (workToEdit: Work) => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;
    const serializedDate = workToEdit.date.toISOString();
    const title = workToEdit.pricePerUnit
      ? `(${workToEdit.pricePerUnit} per ${workToEdit.type.unit})`
      : "";
    navigation.navigate(stack, {
      screen: "AddWork",
      params: {
        title: `Edit Work ${title}`,
        work: { ...workToEdit, date: serializedDate },
        isEditMode: true,
      },
    });
  };

  const handleDeleteWork = (workToDelete: Work) => {
    setSelectedWork(workToDelete);
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteWork = async () => {
    if (!selectedWork) return;
    setError("");
    try {
      await WorkService.deleteWork(selectedWork.id);
      setLedgerWorks((prev) => prev.filter((w) => w.id !== selectedWork.id));
      setGlobalWorks((prev) => prev.filter((w) => w.id !== selectedWork.id));
    } catch (deleteError) {
      setError(deleteError.message || "Error deleting work.");
    } finally {
      setSelectedWork(null);
      setIsDeleteModalVisible(false);
    }
  };

  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios"
      ? { behavior: "padding" as const, keyboardVerticalOffset: 100 }
      : {};

  const currentAmount =
    quantity && workType.pricePerUnit
      ? (parseFloat(quantity) * workType.pricePerUnit).toFixed(2)
      : "0.00";

  return (
    <Wrapper style={{ flex: 1 }} {...wrapperProps}>
      <ConfirmationModal
        warningMessage={"Are you sure you want to delete this work?"}
        isModalVisible={isDeleteModalVisible}
        setIsModalVisible={setIsDeleteModalVisible}
        onConfirm={confirmDeleteWork}
      />
      <View
        style={{
          ...commonStyles.container,
          backgroundColor: REPORT_BACKGROUND_COLOR,
          flex: 1,
        }}
      >
        <FlatList
          ListHeaderComponent={() => <View />}
          inverted={true}
          ListFooterComponent={() => {
            return (
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <View
                  style={{
                    marginBottom: 16,
                    width: "100%",
                    paddingHorizontal: 16,
                  }}
                >
                  {user && user.lastSettlementDate && (
                    <View style={{ marginTop: 8, alignItems: "center" }}>
                      <Button
                        mode="text"
                        compact
                        onPress={() => setShowAllWorks(!showAllWorks)}
                        textColor={theme.colors.primary}
                      >
                        {showAllWorks
                          ? "Showing all history. Tap to filter by settlement"
                          : "Showing since last settlement. Tap to show all"}
                      </Button>
                    </View>
                  )}
                </View>

                {isRefreshing && <Loading />}
                {!hasMore && ledgerWorks.length > 0 && (
                  <Text style={{ marginVertical: 10 }}>
                    You have reached the end of list
                  </Text>
                )}
                <LoadingError error={error} isLoading={false} />
              </View>
            );
          }}
          data={ledgerWorks}
          renderItem={({ item }) => (
            <WorkChatBubble
              work={item}
              onEdit={() => handleEditWork(item)}
              onDelete={() => handleDeleteWork(item)}
            />
          )}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          onEndReached={() => fetchWorks()}
          onEndReachedThreshold={0.5}
        />
      </View>

      <View
        style={[
          styles.paymentBar,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: Math.max(insets.bottom, UI_ELEMENTS_GAP),
          },
        ]}
      >
        <LoadingError error={error} isLoading={isSending} />

        {showMessage && (
          <View style={{ marginBottom: 8 }}>
            <TextInput
              placeholder="Add a message or description..."
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              dense
              style={styles.messageInput}
              right={
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    setShowMessage(false);
                    setDescription("");
                  }}
                />
              }
            />
          </View>
        )}

        {/* Quantity row */}
        <View style={styles.amountRow}>
          <IconButton
            testID="message-toggle-button"
            icon={showMessage ? "message-text" : "message-text-outline"}
            mode="contained-tonal"
            size={22}
            onPress={() => setShowMessage(!showMessage)}
            style={[
              styles.messageToggle,
              {
                backgroundColor: showMessage
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          />

          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 4, marginBottom: 2 }}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary, fontWeight: "bold" }}
              >
                {workType.name}
              </Text>
            </View>
            <View style={styles.amountInputWrapper}>
              <TextInput
                keyboardType="numeric"
                placeholder={`Qty (${workType.unit || "unit"})`}
                value={quantity}
                onChangeText={setQuantity}
                mode="flat"
                style={[styles.amountInput, { backgroundColor: "transparent" }]}
                contentStyle={styles.amountInputContent}
                underlineStyle={{ display: "none" }}
                placeholderTextColor={theme.colors.outlineVariant}
              />
              {quantity !== "" && workType.pricePerUnit > 0 && (
                <Text style={{ color: theme.colors.outline, marginRight: 8 }}>
                  = ₹{currentAmount}
                </Text>
              )}
            </View>
          </View>

          <IconButton
            testID="send-icon-button"
            icon="send"
            mode="contained"
            size={26}
            disabled={!quantity || isSending}
            onPress={handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  quantity && !isSending
                    ? theme.colors.primary
                    : theme.colors.surfaceDisabled,
              },
            ]}
            iconColor={
              quantity && !isSending
                ? theme.colors.onPrimary
                : theme.colors.onSurfaceDisabled
            }
          />

          <IconButton
            icon="refresh"
            mode="contained-tonal"
            size={22}
            onPress={fetchWorks}
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        </View>
      </View>
      {Platform.OS === "android" && keyboardHeight > 0 && (
        <View style={{ height: keyboardHeight + 20 }} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  paymentBar: {
    paddingHorizontal: UI_ELEMENTS_GAP,
    paddingVertical: UI_ELEMENTS_GAP,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageInput: {
    marginTop: 8,
    fontSize: 14,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  messageToggle: {
    margin: 0,
    borderRadius: BORDER_RADIUS,
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 12,
    height: 52,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 0,
    height: 52,
  },
  amountInputContent: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 0,
  },
  sendButton: {
    margin: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  refreshButton: {
    margin: 0,
    borderRadius: BORDER_RADIUS,
  },
});

export default WorkLedgerScreen;
