// src/components/RoleItem.test.tsx

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RoleItem from "../../components/RoleItem";

// Mock the onDelete and onPress functions
const mockOnPress = jest.fn();
const mockOnDelete = jest.fn();

const roleMock = {
  id: "1",
  name: "Administrator",
};

describe("<RoleItem />", () => {
  it("renders correctly", () => {
    const { getByText, getByTestId } = render(
      <RoleItem
        role={roleMock}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    // Check if the role name is rendered
    const roleNameText = getByText("Administrator");
    expect(roleNameText).toBeTruthy();

    // Check if the delete button is rendered
    const deleteButton = getByTestId("delete-button");
    expect(deleteButton).toBeTruthy();
  });

  it("triggers onPress when pressed", () => {
    const { getByTestId } = render(
      <RoleItem
        role={roleMock}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    const roleCard = getByTestId("role-card");
    fireEvent.press(roleCard);

    // Check if onPress is called
    expect(mockOnPress).toHaveBeenCalled();
  });

  it("triggers onDelete when delete button is pressed", () => {
    const { getByTestId } = render(
      <RoleItem
        role={roleMock}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = getByTestId("delete-button");
    fireEvent.press(deleteButton);

    // Check if onDelete is called
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
