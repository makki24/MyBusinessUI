import Labels from "../../../components/common/Labels";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { tagsState } from "../../../recoil/atom";
import { ScrollView, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Tag } from "../../../types";

interface ScreensParms {
  screen: string;
  params: {
    title: string;
  };
}

type RootStackParamList = {
  [key: string]: {
    screen: string;
    params: {
      title: string;
      addingWork: boolean;
      tags: Tag[];
    };
  };
  // Add other screens here
};

interface TagsSelectorProps {
  route: {
    params: {
      nextStep: {
        stack: string;
        stackParams: ScreensParms;
      };
    };
  };
}

type NavigationProp = StackNavigationProp<RootStackParamList, "TagsStack">;

const TagsSelector: React.FC<TagsSelectorProps> = ({ route }) => {
  const tags = useRecoilValue(tagsState);
  const [selectedTags, SetSelectedTags] = useState<Tag[]>([]);
  const navigation = useNavigation<NavigationProp>();

  const navigate = () => {
    navigation.navigate(route.params.nextStep.stack, {
      screen: route.params.nextStep.stackParams.screen,
      params: {
        title: route.params.nextStep.stackParams.params.title,
        addingWork: true,
        tags: selectedTags,
      },
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView>
        <Labels
          items={tags}
          label={""}
          setSelectedChips={SetSelectedTags}
          selectedChips={selectedTags}
        />
      </ScrollView>
      <Button title={"Continue"} onPress={navigate} icon={"skip-next"} />
    </View>
  );
};

export default TagsSelector;
