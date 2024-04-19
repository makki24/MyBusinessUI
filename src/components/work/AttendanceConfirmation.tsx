import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Tag, User, Work, WorkType } from "../../../types";
import Labels from "../../../components/common/Labels";
import commonStyles from "../../styles/commonStyles";
import { Divider, Snackbar, Text } from "react-native-paper";
import NumberInput from "../../../components/common/NumberInput";
import AttendanceEditor from "./AttendanceEditor";
import Button from "../../../components/common/Button";
import attendanceService from "./AttendanceService";
import LoadingError from "../../../components/common/LoadingError";

interface AttendanceConfirmationProps {
  route: {
    params: {
      users: User[];
      date: Date[];
      type: WorkType;
      tags: Tag[];
    };
  };
}

const AttendanceConfirmation: React.FC<AttendanceConfirmationProps> = ({
  route,
}) => {
  const [_users, setUsers] = useState<User[]>([]);
  const [_type, setType] = useState<WorkType>();
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [respMessage, setRespMessage] = useState("");

  useEffect(() => {
    setUsers(route.params.users);
    setType(route.params.type);

    const createdWorks: Work[] = [];
    route.params.users.forEach((user) => {
      const createdWork: Work = {
        pricePerUnit: route.params.type.pricePerUnit,
        description:
          `Added by Attendance ` +
          route.params.date
            .map((date) => new Date(date).toDateString())
            .join("\n"),
        quantity: route.params.date.length,
        user: user,
        date: new Date(),
        type: route.params.type,
        amount: route.params.type.pricePerUnit * route.params.date.length,
        tags: route.params.tags,
      };
      createdWorks.push(createdWork);
    });

    setWorks(createdWorks);
  }, [route.params]);

  const editWork = (user: User, key: string, value) => {
    value = parseFloat(value);
    setWorks((prevState) => {
      return prevState.map((work) => {
        if (work?.user?.id != user.id) return work;
        work[key] = value;

        let calculatedAmount = work.pricePerUnit * work.quantity;
        calculatedAmount = Math.round(calculatedAmount * 100.0) / 100.0;
        work.amount = calculatedAmount;
        work.description = `${work.description}\n ${key} changed to ${value}`;

        return work;
      });
    });
  };

  const submitWorks = async () => {
    try {
      const resp = await attendanceService.createWorks(works);
      setSnackbarVisible(true);
      setRespMessage(resp);
    } catch (err) {
      setError(err.message ?? "An error occurred while adding the works");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item: work }) => (
    <View style={commonStyles.row}>
      <Text>{work?.user?.name}</Text>
      <View style={{ width: "50%" }}>
        {route.params.date.map((item) => (
          <AttendanceEditor
            key={`${work?.user.id}${new Date(item).toDateString()}`}
            user={work?.user}
            date={item}
            editWork={editWork}
            work={work}
          />
        ))}
      </View>
      <View>
        <NumberInput
          label={`Per ${work?.type.unit}`}
          value={`${work?.pricePerUnit}`}
          onChangeText={(value) => editWork(work?.user, "pricePerUnit", value)}
        />
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />
      <Labels items={route.params.tags} label={""} />
      <FlatList
        data={works}
        renderItem={renderUserItem}
        keyExtractor={(item: User, index) => `${index}`}
        ItemSeparatorComponent={() => <Divider />}
      />
      <Button icon={"calendar"} title={"Submit"} onPress={submitWorks} />
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
