import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View } from "react-native";
import { Card, Text, Avatar, useTheme } from "react-native-paper";
import AttendanceEditor from "./AttendanceEditor";
import NumberInput from "../../../../components/common/NumberInput";
import ProfilePicture from "../../common/ProfilePicture";
import { User, Work } from "../../../../types";

interface AttendanceConfirmationUserProps {
  work: Work;
  setWorks: Dispatch<SetStateAction<Work[]>>;
  date: Date[];
}

const AttendanceConfirmationUser: React.FC<AttendanceConfirmationUserProps> = ({
  work,
  date,
  setWorks,
}) => {
  const [userPricePerUnit, setUserPricePerUnit] = useState<string>(
    `${work.pricePerUnit}`,
  );
  const theme = useTheme();

  const editWork = (user: User, key: string, value) => {
    value = parseFloat(value);
    setWorks((prevState) => {
      return prevState.map((prevWork) => {
        if (prevWork?.user?.id != user.id) return prevWork;
        prevWork[key] = value;

        let calculatedAmount = prevWork.pricePerUnit * prevWork.quantity;
        calculatedAmount = Math.round(calculatedAmount * 100.0) / 100.0;
        prevWork.amount = calculatedAmount;
        return prevWork;
      });
    });
  };

  useEffect(() => {
    work.pricePerUnit = parseFloat(userPricePerUnit);
  }, [userPricePerUnit]);

  return (
    <Card
      style={{
        marginBottom: 12,
        elevation: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
        {work?.user?.picture ? (
          <ProfilePicture size={40} picture={work.user.picture} />
        ) : (
          <Avatar.Text
            size={40}
            label={work?.user?.name?.charAt(0).toUpperCase() || "?"}
          />
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text variant="titleMedium">{work?.user?.name}</Text>
        </View>
        <View style={{ width: 110 }}>
          <NumberInput
            label={`Per ${work?.type.unit}`}
            value={userPricePerUnit}
            onChangeText={(value) => {
              setUserPricePerUnit(value);
              editWork(work?.user, "pricePerUnit", value);
            }}
            dense
            style={{ marginBottom: 0, height: 44 }}
          />
        </View>
      </View>

      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.015)",
          paddingHorizontal: 12,
          paddingBottom: 8,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.05)",
        }}
      >
        {date.map((item) => (
          <AttendanceEditor
            key={`${work?.user.id}${new Date(item).toDateString()}`}
            user={work?.user}
            date={item}
            editWork={editWork}
            work={work}
          />
        ))}
      </View>
    </Card>
  );
};

export default AttendanceConfirmationUser;
