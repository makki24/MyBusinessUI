import { middleManState } from "./atom";
import UserDetails from "../../../components/common/UserDetails";
import { useRecoilState } from "recoil";
import commonStyles from "../../styles/commonStyles";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Icon, Snackbar, Title, useTheme } from "react-native-paper";
import { REPORT_ICON_SIZE } from "../../styles/constants";
import commonAddScreenStyles from "../../styles/commonAddScreenStyles";
import AddWorkInputs from "../common/AddWorkInputs";
import middleManService from "./MiddleManService";
import LoadingError from "../../../components/common/LoadingError";
import { useTagsClosed } from "../tags/TagsSelector";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import TagsSelectorButton from "../common/TagsSelectorButton";
import { WorkAndSale as WorkAndSaleType } from "../../../types";

interface WorkAndSaleProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const WorkAndSale: React.FC<WorkAndSaleProps> = ({ navigation }) => {
  const theme = useTheme();
  const [workAndSaleState, setWorkAndSaleState] =
    useRecoilState(middleManState);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [respMessage, setRespMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [worksLength, setWorksLength] = useState(0);

  useEffect(() => {
    setWorksLength(workAndSaleState.works.length - 1);
  }, [workAndSaleState]);

  const onAddWork = async (workAndSale: WorkAndSaleType) => {
    setError("");
    try {
      const resp = await middleManService.createWorksAndSales(workAndSale);
      setSnackbarVisible(true);
      setRespMessage(resp);
      setDisabled(true);
    } catch (err) {
      setError(err.message ?? "An error occurred while adding the works");
      setDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openTags = () => {
    navigation.navigate("MiddleManStack", {
      screen: "TagsSelector",
      params: {
        selectedTags: workAndSaleState.sale.tags,
      },
    });
  };

  useTagsClosed(({ tags }) => {
    setWorkAndSaleState(
      (prev): WorkAndSaleType => ({
        ...prev,
        sale: { ...prev.sale, tags: tags },
        works: [...prev.works.map((work) => ({ ...work, tags: tags }))],
      }),
    );
  }, []);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />
      <View style={commonStyles.row}>
        <View style={{ width: "50%" }}>
          <UserDetails user={workAndSaleState.sale.user} />
          <Icon
            source="chevron-triple-down"
            size={REPORT_ICON_SIZE * 2}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ ...commonStyles.simpleRow, width: "50%" }}>
          <Title>
            Adding {workAndSaleState.works[worksLength].type?.name} ({" "}
            {workAndSaleState.works[worksLength].type?.unit !== "null"
              ? `Per ${workAndSaleState.works[worksLength].type?.unit} :`
              : ""}{" "}
            {workAndSaleState.works[worksLength].type?.pricePerUnit} )
          </Title>
        </View>
      </View>
      <View style={{ ...commonStyles.simpleRow, flexWrap: "wrap" }}>
        {workAndSaleState.works.map((work, index) => (
          <UserDetails key={index} user={work.user} />
        ))}
      </View>

      <TagsSelectorButton
        openTags={openTags}
        selectedTags={workAndSaleState.sale.tags}
      />

      <AddWorkInputs disabled={disabled} onAddWork={onAddWork} />
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
    </ScrollView>
  );
};

export default WorkAndSale;
