import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { Text } from "react-native-paper";
import AttendanceEditor from "./AttendanceEditor";
import NumberInput from "../../../../components/common/NumberInput";
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
    <View style={commonStyles.row}>
      <Text>{work?.user?.name}</Text>
      <View style={{ width: "50%" }}>
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
      <View>
        <NumberInput
          label={`Per ${work?.type.unit}`}
          value={userPricePerUnit}
          onChangeText={(value) => {
            setUserPricePerUnit(value);
            editWork(work?.user, "pricePerUnit", value);
          }}
        />
      </View>
    </View>
  );
};

export default AttendanceConfirmationUser;
