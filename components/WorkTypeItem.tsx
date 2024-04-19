// src/components/WorkTypeItem.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { Card, Text, Title, IconButton } from "react-native-paper";
import { WorkType } from "../types";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";

interface WorkTypeItemProps {
  workType: WorkType;
  onPress: (workType: WorkType) => void;
  onEdit: (workType: WorkType) => void; // New prop for the Edit action
  onDelete: () => void;
  readOnly: boolean;
}

const WorkTypeItem: React.FC<WorkTypeItemProps> = ({
  workType,
  onPress,
  onEdit,
  onDelete,
  readOnly = false,
}) => (
  <TouchableOpacity onPress={() => onPress(workType)}>
    <Card style={commonItemStyles.card}>
      <Card.Content
        style={
          readOnly
            ? {
                ...commonStyles.row,
                alignItems: "center",
                ...commonItemStyles.cardContent,
              }
            : commonItemStyles.cardContent
        }
      >
        <Title>{workType.name}</Title>
        <Text>
          {workType.unit !== "null" ? `Per ${workType.unit}` : "Default value"}{" "}
          : {workType.pricePerUnit}
        </Text>
      </Card.Content>
      {!readOnly && (
        <Card.Actions style={commonItemStyles.cardActionsWithTags}>
          {/* Edit action button */}
          <IconButton icon="pencil" onPress={() => onEdit(workType)} />

          {/* Delete action button */}
          <IconButton icon="delete" onPress={onDelete} />
        </Card.Actions>
      )}
    </Card>
  </TouchableOpacity>
);

export default WorkTypeItem;
