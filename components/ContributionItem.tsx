// src/components/ContributionItem.tsx
import React, { FC } from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, Paragraph, Chip } from "react-native-paper";
import { Contribution } from "../types";
import UserDetails from "./common/UserDetails";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";

interface ContributionItemProps {
  contribution: Contribution;
  onPress: () => void;
  onDelete: () => void;
}

const ContributionItem: FC<ContributionItemProps> = ({
  contribution,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={commonItemStyles.card}>
        <Card.Content
          style={contribution.tags.length ? commonItemStyles.cardContent : {}}
        >
          <View style={commonItemStyles.titleContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>
                {contribution.sender && (
                  <UserDetails user={contribution.sender} />
                )}{" "}
                {/* Assuming User has a 'name' property */}
                {!contribution.sender && <Text>Self contribution</Text>}
              </Text>
            </View>
            <UserDetails user={contribution.receiver} />
          </View>
          <View style={commonStyles.row}>
            <Paragraph>{`Date: ${contribution.date.toDateString()}`}</Paragraph>
            <Text variant="titleMedium">{`${contribution.amount}`}</Text>
          </View>
          {contribution.tags.length > 0 && (
            <View style={commonItemStyles.tagsContainer}>
              <Text style={commonItemStyles.tagsLabel}>Tags: </Text>
              <View style={commonItemStyles.tagChipsContainer}>
                {contribution.tags.map((tag) => (
                  <Chip key={tag.id} style={commonItemStyles.tagChip}>
                    {tag.name}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
        <Card.Actions
          style={
            contribution.tags.length
              ? commonItemStyles.cardActionsWithTags
              : commonItemStyles.cardActions
          }
        >
          <IconButton icon="delete" onPress={onDelete} />
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};

export default ContributionItem;
