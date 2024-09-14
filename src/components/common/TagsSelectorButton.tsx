import Labels from "../../../components/common/Labels";
import { Button, Icon, useTheme } from "react-native-paper";
import React from "react";
import { Tag } from "../../../types";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

interface TagsSelectorButtonProps {
  selectedTags: Tag[];
  label?: string;
  notifyId: string;
}

const TagsSelectorButton: React.FC<TagsSelectorButtonProps> = ({
  selectedTags,
  label,
  notifyId,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const openTags = () => {
    const index = navigation.getParent().getState().index;
    const stack = navigation.getParent().getState().routes[index].name;
    navigation.navigate(stack, {
      screen: "TagsSelector",
      params: {
        selectedTags: selectedTags,
        notifyId: notifyId,
      },
    });
  };

  return (
    <>
      <>{selectedTags && <Labels label={""} items={selectedTags} />}</>
      <Button style={{ alignSelf: "flex-start" }} onPress={openTags}>
        {label ?? "Select Tags"}
        <Icon source="tag" size={20} color={theme.colors.primary} />
      </Button>
    </>
  );
};

export default TagsSelectorButton;
