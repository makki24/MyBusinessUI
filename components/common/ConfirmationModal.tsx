// EmailInput.js
import React from "react";
import { Button, Text } from "react-native-paper";
import { View } from "react-native";
import commonStyles from "../../src/styles/commonStyles";
import Modal from "./Modal";

type ConfirmationModalProps = {
  warningMessage: string;
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  warningMessage,
  isModalVisible,
  setIsModalVisible,
  onConfirm,
}) => {
  return (
    <Modal
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
    >
      <Text>{warningMessage}</Text>
      <View style={commonStyles.modalButtonGap} />
      <View style={commonStyles.modalButtonGap} />
      <Button
        icon="cancel"
        mode="outlined"
        onPress={() => setIsModalVisible(false)}
      >
        Cancel
      </Button>
      <View style={commonStyles.modalButtonGap} />
      <Button
        icon="delete"
        mode="contained"
        onPress={onConfirm}
        testID="confirm-delete-button"
      >
        Delete
      </Button>
    </Modal>
  );
};

export default ConfirmationModal;
