import React, { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { Tag, User, Work, WorkType } from "../../../../types";
import commonStyles from "../../../styles/commonStyles";
import { Divider, Snackbar, TextInput } from "react-native-paper";
import Button from "../../../../components/common/Button";
import attendanceService from "./AttendanceService";
import LoadingError from "../../../../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { UI_ELEMENTS_GAP } from "../../../styles/constants";
import TagsSelectorButton from "../../common/TagsSelectorButton";
import AttendanceConfirmationUser from "./AttendanceConfirmationUser";
import commonAddScreenStyles from "../../../styles/commonAddScreenStyles";
import { makeEventNotifier } from "../../common/useEventListner";

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

  const renderUserItem = ({ item: work }) => (
    <AttendanceConfirmationUser
      date={route.params.date}
      setWorks={setWorks}
      work={work}
    />
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
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <TagsSelectorButton
        selectedTags={selectedTags}
        notifyId={tagsSelectedNotifier.name}
      />

      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={commonAddScreenStyles.inputField}
      />

      <FlatList
        data={works}
        renderItem={renderUserItem}
        keyExtractor={(item: User, index) => `${index}`}
        ItemSeparatorComponent={() => <Divider />}
      />
      {created && (
        <Button
          style={{ marginBottom: UI_ELEMENTS_GAP }}
          icon={"exit-run"}
          title={"Back to Works"}
          onPress={() => navigation.navigate("WorkStack", { screen: "Work" })}
        />
      )}
      <Button
        disabled={created || isLoading}
        icon={"calendar"}
        title={"Submit"}
        onPress={submitWorks}
      />
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
    </View>
  );
};

export default AttendanceConfirmation;
