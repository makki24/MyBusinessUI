// src/screens/AddTagScreen.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { useRecoilState } from "recoil";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import TagsService from "../services/TagsService"; // Adjust the path accordingly
import { tagsState } from "../recoil/atom"; // Adjust the path accordingly
import commonStyles from "../src/styles/commonStyles";
import LoadingError from "../components/common/LoadingError";
import { NavigationProp, ParamListBase } from "@react-navigation/native"; // Adjust the path accordingly

interface AddTagScreenProps {
  navigation: NavigationProp<ParamListBase>; // Adjust this type based on your navigation stack
}

const AddTagScreen: React.FC<AddTagScreenProps> = ({ navigation }) => {
  const [tagName, setTagName] = useState("");
  const [_, setTags] = useRecoilState(tagsState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = async () => {
    try {
      if (!tagName) {
        setError("Tag name cannot be empty"); // Set the error message
        return;
      }

      setIsLoading(true); // Set loading to true

      // Call your API service to add a new tag
      const newTag = await TagsService.addTag({ name: tagName });

      // Update Recoil state with the new tag
      setTags((prevTags) => [...prevTags, newTag]);

      // Navigate back to the Tags screen
      navigation.goBack();
    } catch (addError) {
      setError(addError.message || "An error occurred"); // Set the error message
    } finally {
      setIsLoading(false); // Set loading to false regardless of success or failure
    }
  };

  return (
    <View style={commonStyles.container}>
      <LoadingError error={error} isLoading={isLoading} />

      <Input
        placeholder="Enter tag name"
        value={tagName}
        onChangeText={setTagName}
      />
      <Button title="Add Tag" onPress={handleAddTag} />
    </View>
  );
};

export default AddTagScreen;
