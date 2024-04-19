import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { FAB, Card, Title } from "react-native-paper";
import { useRecoilState } from "recoil";
import { tagsState } from "../recoil/atom";
import TagsService from "../services/TagsService";
import commonScreenStyles from "../src/styles/commonScreenStyles";
import commonItemStyles from "../src/styles/commonItemStyles";
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native"; // Assuming you have a tags atom

interface TagsScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const TagsScreen: React.FC<TagsScreenProps> = ({ navigation }) => {
  const [tags, setTags] = useRecoilState(tagsState);
  const [error, setError] = useState(null);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTags = async () => {
    try {
      setIsRefreshing(true);
      const tagsData = await TagsService.getTags();
      setTags(tagsData);
    } catch (fetchError) {
      handleError(fetchError, "Error fetching tags. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleError = (errorArg, defaultMessage) => {
    setError(errorArg.message || defaultMessage);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEditTag = () => {};

  const handleRefresh = () => {
    fetchTags();
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      {!error && (
        <FlatList
          data={tags}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleEditTag()}>
              <Card style={commonItemStyles.card}>
                <Card.Content>
                  <Title>{item.name}</Title>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      <FAB
        style={commonScreenStyles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddTag")}
      />
    </View>
  );
};

export default TagsScreen;
