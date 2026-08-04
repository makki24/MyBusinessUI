import React, { useEffect, useRef, useState } from "react";
import { FlatList, View, KeyboardAvoidingView, Platform } from "react-native";
import { Tag, User, Work, WorkType } from "../../../../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import commonStyles from "../../../styles/commonStyles";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Divider,
  Snackbar,
  TextInput,
  Surface,
  useTheme,
} from "react-native-paper";
import Button from "../../../../components/common/Button";
import attendanceService from "./AttendanceService";
import LoadingError from "../../../../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { UI_ELEMENTS_GAP } from "../../../styles/constants";
import TagsSelectorButton from "../../common/TagsSelectorButton";
import AttendanceConfirmationUser from "./AttendanceConfirmationUser";
import commonAddScreenStyles from "../../../styles/commonAddScreenStyles";
import { makeEventNotifier } from "../../common/useEventListner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AttendanceConfirmationProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
  route: {
    params: {
      users: User[];
      date: Date[];
      type: WorkType;
    };
  };
}

const AttendanceConfirmation: React.FC<AttendanceConfirmationProps> = ({
  route,
  navigation,
}) => {
  const [_users, setUsers] = useState<User[]>([]);
  const [_type, setType] = useState<WorkType>();
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [respMessage, setRespMessage] = useState("");
  const [created, setCreated] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [description, setDescription] = useState("");
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setUsers(route.params.users);
    setType(route.params.type);

    const createdWorks: Work[] = [];
    route.params.users.forEach((user) => {
      const createdWork: Work = {
        pricePerUnit: route.params.type.pricePerUnit,
        description: description,
        quantity: route.params.date.length,
        user: user,
        date: new Date(),
        type: route.params.type,
        amount: route.params.type.pricePerUnit * route.params.date.length,
        tags: route.params.type.defaultTags ?? [],
      };
      createdWorks.push(createdWork);
    });
    setSelectedTags(route.params.type.defaultTags);

    setWorks(createdWorks);
  }, [route.params]);

  useEffect(() => {
    setWorks((prevState) =>
      prevState.map((work: Work) => ({ ...work, description: description })),
    );
  }, [description]);

  const submitWorks = async () => {
    try {
      setIsLoading(true);
      const resp = await attendanceService.createWorks(works);
      setSnackbarVisible(true);
      setRespMessage(resp);
      setCreated(true);
    } catch (err) {
      setError(err.message ?? "An error occurred while adding the works");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = React.useCallback(
    ({ item: work }) => (
      <AttendanceConfirmationUser
        date={route.params.date}
        setWorks={setWorks}
        work={work}
      />
    ),
    [route.params.date, setWorks],
  );

  const tagsSelectedNotifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(
      "OnTagsSelectedAndClosedInAttendanceConfirmation",
    ),
  ).current;

  const tagsSelectedListner = ({ tags }) => {
    setWorks((prevWorks) => prevWorks.map((work) => ({ ...work, tags: tags })));
    setSelectedTags(tags);
  };

  tagsSelectedNotifier.useEventListener(tagsSelectedListner, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1 }}>
        <LoadingError error={error} isLoading={isLoading} />

        <Surface
          style={{
            padding: 16,
            elevation: 2,
            marginBottom: 8,
            marginHorizontal: 8,
            marginTop: 8,
            borderRadius: 12,
          }}
        >
          <TagsSelectorButton
            selectedTags={selectedTags}
            notifyId={tagsSelectedNotifier.name}
          />
          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[commonAddScreenStyles.inputField, { marginTop: 12 }]}
          />
        </Surface>

        <FlatList
          data={works}
          renderItem={renderUserItem}
          keyExtractor={(item, index) => `${index}`}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
        />
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.08)",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {created && (
          <Button
            style={{ marginBottom: UI_ELEMENTS_GAP, marginHorizontal: 0 }}
            icon={"exit-run"}
            title={"Back to Works"}
            onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
          />
        )}
        <Button
          style={{ margin: 0 }}
          disabled={created || isLoading}
          icon={"calendar"}
          title={"Submit"}
          onPress={submitWorks}
        />
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {respMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default AttendanceConfirmation;
