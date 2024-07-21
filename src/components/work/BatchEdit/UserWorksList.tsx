import { FlatList, View } from "react-native";
import React, { useEffect, useState } from "react";
import WorkItem from "../../../../components/WorkItem";
import CustomDateRange from "../../common/CustomDateRange";
import commonStyles from "../../../styles/commonStyles";
import workService from "../../../../services/WorkService";
import { Filter } from "../../../../types";
import { DEFAULT_SORT } from "../../../constants/filter";
import LoadingError from "../../../../components/common/LoadingError";
import NumberInput from "../../../../components/common/NumberInput";
import { UI_ELEMENTS_GAP } from "../../../styles/constants";
import { useRecoilState } from "recoil";
import { batchEditPayloadState } from "./atom";
import Button from "../../../../components/common/Button";
import { Snackbar } from "react-native-paper";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";

const UserWorksList = () => {
  const [works, setWorks] = useState([]);
  const rangeState = React.useState({
    startDate: new Date("2022-12-20"),
    endDate: new Date(),
  });
  const [range] = rangeState;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [oldPricePerUnit, setOldPricePerUnit] = useState("");

  const [editPayload] = useRecoilState(batchEditPayloadState);
  const [filter, setFilter] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const getWorks = async () => {
    const currentFilter: Filter = {
      sender: [],
      receiver: [],
      fromDate: range.startDate,
      toDate: range.endDate,
      user: [editPayload.user],
      tags: [],
      type: [{ ...editPayload.type, type: "work" }],
    };
    setFilter(currentFilter);
    setIsLoading(true);
    try {
      const worksList = await workService.filterWork({
        filter: currentFilter,
        sort: DEFAULT_SORT,
      });
      const transformWork = (worksData) => {
        return worksData.map((work) => ({
          ...work,
          date: new Date(work.date),
        }));
      };

      if (worksList.length)
        setOldPricePerUnit(worksList[0].pricePerUnit.toString());

      setWorks(transformWork(worksList));
    } catch (e) {
      setError(e.message || "Error setting filters.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWorks();
  }, [range]);

  useEffect(() => {
    setPricePerUnit(oldPricePerUnit);
  }, [oldPricePerUnit]);

  const updateWorks = async () => {
    setIsLoading(true);
    try {
      const response = await workService.batchUpdateWorkRequest({
        pricePerUnit,
        filter,
        oldPricePerUnit,
      });
      setIsActionModalVisible(true);
      setModalMessage(response);
    } catch (e) {
      setError(e.message || "Error Updating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  const confirmAction = async () => {
    try {
      const response = await workService.batchUpdateWork({
        pricePerUnit,
        filter,
        oldPricePerUnit,
      });
      setSnackBarMessage(response);
      setSnackbarVisible(true);
      getWorks();
    } catch (e) {
      setError(e.message || "Error Updating. Please try again.");
    } finally {
      setIsLoading(false);
      setIsActionModalVisible(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError isLoading={isLoading} error={error} />
      <CustomDateRange rangeState={rangeState} />
      <View style={{ marginTop: UI_ELEMENTS_GAP }}>
        <NumberInput
          label="Old Price per unit"
          value={oldPricePerUnit}
          onChangeText={setOldPricePerUnit}
        />
      </View>

      <NumberInput
        label="Price per unit"
        value={pricePerUnit}
        onChangeText={setPricePerUnit}
      />
      <Button
        icon={"update"}
        mode="contained"
        onPress={updateWorks}
        title={"Update work"}
        disabled={isLoading}
      />
      <FlatList
        data={works}
        renderItem={({ item: workItem }) => (
          <WorkItem work={workItem} onPress={() => {}} onDelete={() => {}} />
        )}
      />
      <ConfirmationModal
        warningMessage={modalMessage}
        isModalVisible={isActionModalVisible}
        setIsModalVisible={setIsActionModalVisible}
        onConfirm={confirmAction}
        label={"Update"}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onSnackbarDismiss}
        duration={3000}
      >
        {snackBarMessage}
      </Snackbar>
    </View>
  );
};

export default UserWorksList;
