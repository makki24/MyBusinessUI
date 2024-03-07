// src/components/WorkItem.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card, Title, IconButton, Paragraph } from "react-native-paper";
import { Work } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import Labels from "./common/Labels";

interface WorkItemProps {
  work: Work;
  onPress: () => void;
  onDelete: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ work, onPress, onDelete }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={commonItemStyles.card}>
        <Card.Content
          style={work.tags.length ? commonItemStyles.cardContent : {}}
        >
          <View style={commonItemStyles.titleContainer}>
            <Title>{work.type.name}</Title>
            <Text>
              {work.user && <UserDetails user={work.user} />}{" "}
              {/* Use UserDetails component */}
            </Text>
          </View>
          <View style={commonStyles.row}>
            <Paragraph>
              Date:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {work.date.toDateString()}
              </Text>{" "}
            </Paragraph>
            <Paragraph>
              Quantity:{" "}
              <Text style={{ fontWeight: "bold" }}>{work.quantity}</Text>{" "}
            </Paragraph>
          </View>
          <View style={commonStyles.row}>
            <Paragraph>
              Price Per Unit:{" "}
              <Text style={{ fontWeight: "bold" }}>{work.pricePerUnit}</Text>{" "}
            </Paragraph>
            <Paragraph>
              Amount: <Text style={{ fontWeight: "bold" }}>{work.amount}</Text>{" "}
            </Paragraph>
          </View>
          <View style={commonStyles.row}>
            {work.description && (
              <Paragraph>
                Description:{" "}
                <Text style={{ fontWeight: "bold" }}>{work.description}</Text>{" "}
              </Paragraph>
            )}
          </View>
          {work.tags.length > 0 && <Labels label={"Tags"} items={work.tags} />}
        </Card.Content>
        <Card.Actions
          style={work.tags.length ? commonItemStyles.cardActions : {}}
        >
          <IconButton icon="delete" onPress={onDelete} />
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};

export default WorkItem;
