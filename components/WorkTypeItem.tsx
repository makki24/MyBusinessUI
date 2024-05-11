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
  onAttendance: () => void;
}

const WorkTypeItem: React.FC<WorkTypeItemProps> = ({
  workType,
  onPress,
  onEdit,
  onDelete,
  readOnly = false,
  onAttendance,
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
          {workType.unit !== "null" ? `Per ${workType.unit} :` : ""}{" "}
          {workType.pricePerUnit}
        </Text>
        <Card.Actions style={{ padding: 0 }}>
          <IconButton size={20} icon={"calendar"} onPress={onAttendance} />
        </Card.Actions>
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
