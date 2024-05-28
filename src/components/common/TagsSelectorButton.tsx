import Labels from "../../../components/common/Labels";
import { Button, Icon, useTheme } from "react-native-paper";
import React from "react";
import { Tag } from "../../../types";

interface TagsSelectorButtonProps {
  selectedTags: Tag[];
  openTags: () => void;
}

const TagsSelectorButton: React.FC<TagsSelectorButtonProps> = ({
  selectedTags,
  openTags,
}) => {
  const them = useTheme();

  return (
    <>
      <>{selectedTags && <Labels label={""} items={selectedTags} />}</>
      <Button style={{ alignSelf: "flex-start" }} onPress={openTags}>
        Select Tags
        <Icon source="tag" size={20} color={them.colors.primary} />
      </Button>
    </>
  );
};

export default TagsSelectorButton;
