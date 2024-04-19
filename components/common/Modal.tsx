import React from "react";
import { Portal, Modal as PaperModal, useTheme } from "react-native-paper";
import commonStyles from "../../src/styles/commonStyles";
import { Animated, StyleProp, ViewStyle } from "react-native";

type ModalProps = {
  children: React.ReactNode;
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  contentContainerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};

const Modal: React.FC<ModalProps> = ({
  children,
  isModalVisible,
  setIsModalVisible,
  contentContainerStyle,
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <PaperModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        contentContainerStyle={{
          ...commonStyles.modalContainer,
          ...(contentContainerStyle as ViewStyle),
          backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </PaperModal>
    </Portal>
  );
};

export default Modal;
