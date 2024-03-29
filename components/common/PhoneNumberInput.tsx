// PhoneNumberInput.js
import React, { useState, useEffect, useCallback, memo } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import {
  Button,
  TextInput,
  HelperText,
  List,
  Searchbar,
} from "react-native-paper";
import * as Contacts from "expo-contacts";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import Modal from "./Modal";

interface PhoneNumbers {
  number: string;
}

interface Contact {
  name: string;
  phoneNumbers: PhoneNumbers[];
}

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
}

interface PhoneNumberInputProps {
  label: string;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  style: StyleProp<ViewStyle>;
}

const ContactItem = ({ contact, onPress }: ContactItemProps) => (
  <List.Item
    title={contact.name}
    description={
      contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers[0].number
        : ""
    }
    onPress={onPress}
  />
);

const ContactItemMemo = memo(ContactItem);

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  phoneNumber,
  setPhoneNumber,
  style,
}) => {
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (number) => {
    // Remove non-digit characters
    const numericNumber = number.replace(/\D/g, "");

    // Check if the phone number is either 10 or 13 characters long
    return numericNumber.length >= 10 && numericNumber.length <= 13;
  };

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text);
    if (!validatePhoneNumber(text)) {
      setPhoneNumberError("Invalid phone number");
    } else {
      setPhoneNumberError("");
    }
  };

  const fetchContacts = async (pageOffset = 0) => {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
      pageSize: 50,
      pageOffset,
    });
    return data;
  };

  const selectPhoneNumberFromContacts = async () => {
    setLoading(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      let allContacts = [];
      let newContacts = [];
      let pageOffset = 0;

      do {
        newContacts = await fetchContacts(pageOffset);
        allContacts = [...allContacts, ...newContacts];
        pageOffset += newContacts.length;
      } while (newContacts.length > 0);

      setContacts(allContacts);
      setModalVisible(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (modalVisible) {
      selectPhoneNumberFromContacts();
    }
  }, [modalVisible]);

  const handleContactSelect = useCallback((contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      // Remove whitespaces from the selected phone number
      const selectedPhoneNumber = contact.phoneNumbers[0].number.replace(
        /\s/g,
        "",
      );
      handlePhoneNumberChange(selectedPhoneNumber);
    }
    setModalVisible(false);
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ContactItemMemo
        contact={item}
        onPress={() => handleContactSelect(item)}
      />
    ),
    [],
  );

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          label={label}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          error={!!phoneNumberError}
          style={[style, styles.flex]}
          testID={label.split(" ").join("")}
        />
        <Button onPress={() => setModalVisible(true)}>
          Select from Contacts
        </Button>
      </View>
      {!!phoneNumberError && (
        <HelperText type="error" visible={!!phoneNumberError}>
          {phoneNumberError}
        </HelperText>
      )}
      <Modal
        isModalVisible={modalVisible}
        setIsModalVisible={setModalVisible}
        contentContainerStyle={{ maxHeight: "80%" }}
      >
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            getItemLayout={(data, index) => ({
              length: 50,
              offset: 50 * index,
              index,
            })}
            initialNumToRender={10}
          />
        )}
        <Button onPress={() => setModalVisible(false)}>Close</Button>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex: {
    flex: 1,
  },
});

export default PhoneNumberInput;
