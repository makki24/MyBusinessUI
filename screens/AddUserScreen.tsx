// AddUserScreen.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import {
  Button,
  TextInput,
  Snackbar,
  Text,
  IconButton,
} from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import EmailInput from "../components/common/EmailInput";
import PhoneNumberInput from "../components/common/PhoneNumberInput";
import * as ImagePicker from "expo-image-picker";
import uploadImgtoImgBB from "../src/util/UploadImgtoImgBB";
import userService from "../services/UserService";
import { User, UserWorkTypePrice, WorkType } from "../types";
import { DEFAULT_AVATAR_URL } from "../constants/mybusiness.constants";
import { useRecoilState } from "recoil";
import { rolesState } from "../recoil/atom";
import commonAddScreenStyles from "../src/styles/commonAddScreenStyles";
import LoadingError from "../components/common/LoadingError";
import {
  BORDER_RADIUS,
  IMAGE_UPLOAD_SIZE,
  UI_ELEMENTS_GAP,
} from "../src/styles/constants";
import { ImageSourcePropType } from "react-native/Libraries/Image/Image";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import SwitchInput from "../components/common/SwitchInput";
import commonStyles from "../src/styles/commonStyles";
import WorkTypeSelectorButton from "../src/components/work/AddWork/WorkTypeSelectorButton";
import NumericInput from "../src/components/common/NumericInput";

interface AddUserScreenProps {
  route: {
    params: {
      isEditMode: boolean;
      user: User;
    };
  };
}

interface CustomRoundImageProps {
  source: ImageSourcePropType;
  style: StyleProp<ViewStyle>; // Example: Assume 'style' is an object representing CSS properties
  children?: React.ReactNode; // Optional children prop
}

const AddUserScreen: React.FC<AddUserScreenProps> = ({ route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState<string>(null);
  const [amountToReceive, setAmountToReceive] = useState("");
  const [amountHolding, setAmountHolding] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [_, setPictureUrl] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [roles] = useRecoilState(rolesState);
  const [isOwnAsset, setIsOwnAsset] = useState(false);
  const [isOwnLiability, setIsOwnLiability] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [workTypePrices, setWorkTypePrices] = useState<UserWorkTypePrice[]>([]);
  const workTypeState = useState<WorkType>(null);
  const [selectedType] = workTypeState;

  const onSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  useEffect(() => {
    if (selectedType) {
      setWorkTypePrices((prev) => [
        ...prev,
        {
          type: selectedType,
          unit: "k.g",
          pricePerUnit: 0,
        },
      ]);
    }
  }, [selectedType]);

  useEffect(() => {
    // Check if the screen is in edit mode and user data is provided
    if (route.params?.isEditMode && route.params?.user) {
      setIsEdit(true);
      const editingUser = route.params.user as User;
      setUsername(editingUser.name);
      setEmail(editingUser.email);
      setPicture(editingUser.picture);
      setAmountToReceive(`${editingUser.amountToReceive}`);
      setAmountHolding(`${editingUser.amountHolding}`);
      setPhoneNumber(editingUser.phoneNumber);
      if (editingUser.userProperties) {
        setWorkTypePrices(editingUser.userProperties.workTypePrices);
        setIsOwnLiability(editingUser.userProperties.isOwnLiability);
        setIsOwnAsset(editingUser.userProperties.isOwnAsset);
      }
    }
  }, [route.params?.isEditMode, route.params?.user]);

  const handleAddUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!username || !phoneNumber || !email) {
        throw new Error(
          "Username, Email and Phone Number are mandatory fields.",
        );
      }

      if (!emailValid) {
        throw new Error("Email is not valid");
      }

      let imageUrl;
      if (picture) {
        if (!picture.includes("googleusercontent")) {
          imageUrl = await uploadImgtoImgBB(picture);
          setPictureUrl(imageUrl);
        } else {
          imageUrl = picture;
        }
      }

      // Add your logic to add/update the user here
      const memberRole = roles.filter((role) => role.name === "MEMBER")[0];

      let user: User = {
        name: username,
        email,
        picture: imageUrl,
        phoneNumber,
        roles: route.params?.isEditMode
          ? route.params?.user.roles
          : [memberRole],
        amountHolding: parseFloat(amountHolding),
        amountToReceive: parseFloat(amountToReceive),
        userProperties: null,
      };

      if (route.params?.isEditMode && route.params?.user) {
        // If in edit mode, update the existing user
        user.id = route.params.user.id;
        user.userProperties = {
          user: {
            id: route.params.user.id,
          } as User,
          isOwnAsset: isOwnAsset,
          isOwnLiability: isOwnLiability,
          workTypePrices: workTypePrices,
        };
      }
      user = await userService.addUser(user);

      setSnackbarVisible(true);
    } catch (addError) {
      setError(
        addError?.message ?? "Error adding/updating user. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPicture(result.assets[0].uri);
    }
  };

  const CustomRoundImage: React.FC<CustomRoundImageProps> = ({
    source,
    style,
    children,
  }) => {
    return (
      <TouchableOpacity
        onPress={pickImage}
        style={[
          style,
          { borderRadius: IMAGE_UPLOAD_SIZE / 2, overflow: "hidden" },
        ]}
      >
        <ImageBackground source={source} style={style}>
          {children}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderImageOverlay = () => (
    <View style={styles.editIcon}>
      <AntDesign
        name={picture ? "edit" : "upload"}
        size={IMAGE_UPLOAD_SIZE / 4}
        color="white"
      />
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={commonAddScreenStyles.scrollViewContainer}
    >
      <LoadingError error={error} isLoading={isLoading} />

      <View style={styles.imageContainer}>
        <CustomRoundImage
          source={{ uri: picture || DEFAULT_AVATAR_URL }}
          style={styles.roundedImage}
        >
          {renderImageOverlay()}
        </CustomRoundImage>
      </View>

      <TextInput
        label="Username*"
        value={username}
        onChangeText={setUsername}
        style={commonAddScreenStyles.inputField}
        testID={"username"}
        autoCapitalize={"words"}
      />
      <EmailInput
        style={commonAddScreenStyles.inputField}
        label="Email*"
        setEmail={setEmail}
        onValidationChange={setEmailValid}
        email={email}
      />
      <PhoneNumberInput
        label="Phone Number*"
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        style={commonAddScreenStyles.inputField}
      />
      {isEdit && (
        <>
          <View style={commonStyles.row}>
            <SwitchInput
              label="Is Own Asset ?"
              value={isOwnAsset}
              onValueChange={(value) => {
                setIsOwnAsset(value);
              }}
            />
            <SwitchInput
              label="Is Own Liability ?"
              value={isOwnLiability}
              onValueChange={(value) => {
                setIsOwnLiability(value);
              }}
            />
          </View>
          {workTypePrices.map((price, index) => {
            return (
              <View
                style={{ ...commonStyles.row, alignItems: "center" }}
                key={index}
              >
                <Text>{price.type.name}</Text>
                <NumericInput
                  initialValue={`${price.pricePerUnit}`}
                  onChange={(value) => {
                    setWorkTypePrices((prev) => [
                      ...prev.map((workTypePrice, ind) => {
                        let pp = workTypePrice.pricePerUnit;
                        if (index === ind) {
                          pp = +value;
                        }
                        return { ...workTypePrice, pricePerUnit: pp };
                      }),
                    ]);
                  }}
                />
                <Text>{price.unit}</Text>
                <IconButton
                  icon="delete"
                  onPress={() => {
                    setWorkTypePrices((prev) =>
                      prev.filter((item, ind) => index !== ind),
                    );
                  }}
                />
              </View>
            );
          })}
          <WorkTypeSelectorButton workType={workTypeState} />
        </>
      )}
      <Button mode="contained" onPress={handleAddUser}>
        {route.params?.isEditMode ? "Update User" : "Add User"}
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onSnackbarDismiss}
        duration={3000}
      >
        {`User ${route.params?.isEditMode ? "updated" : "added"} successfully`}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginBottom: UI_ELEMENTS_GAP,
    position: "relative",
  },

  roundedImage: {
    width: IMAGE_UPLOAD_SIZE,
    height: IMAGE_UPLOAD_SIZE,
    borderRadius: IMAGE_UPLOAD_SIZE / 2,
    overflow: "hidden", // Ensure content is clipped to the rounded shape
    marginBottom: UI_ELEMENTS_GAP,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: "black",
    borderRadius: BORDER_RADIUS,
    padding: UI_ELEMENTS_GAP / 2,
    alignItems: "center",
  },
});

export default AddUserScreen;
