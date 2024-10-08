import Labels from "../../../components/common/Labels";
import React, { useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { tagsState } from "../../../recoil/atom";
import { ScrollView, View } from "react-native";
import commonStyles from "../../styles/commonStyles";
import Button from "../../../components/common/Button";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Tag } from "../../../types";
import { makeEventNotifier } from "../common/useEventListner";

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
      selectedTags: Tag[];
      notifyId: string;
    };
  };
}

type NavigationProp = StackNavigationProp<RootStackParamList, "TagsStack">;

const TagsSelector: React.FC<TagsSelectorProps> = ({ route }) => {
  const tags = useRecoilValue(tagsState);
  const [selectedTags, SetSelectedTags] = useState<Tag[]>(
    route.params.selectedTags ?? [],
  );
  const navigation = useNavigation<NavigationProp>();

  const notifier = useRef(
    makeEventNotifier<{ tags: Tag[] }, unknown>(route.params.notifyId),
  ).current;

  const navigate = () => {
    notifier.notify({ tags: selectedTags });
    navigation.goBack();
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
