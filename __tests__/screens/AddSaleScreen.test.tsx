import fetchMock from "jest-fetch-mock";
import React from "react";
import {
  render,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import { expenseTypesState, usersState } from "../../recoil/atom";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import AddSaleScreen from "../../screens/AddSaleScreen";
import { Sale, User } from "../../types";
import SaleService from "../../services/SaleService";
jest.useFakeTimers();

// Enable fetch mocks
fetchMock.enableMocks();

jest.mock("@react-native-async-storage/async-storage", () => {
  const mockStorage: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(() => Promise.resolve("dummyToken")),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
    },
  };
});

jest.mock("../../services/SaleService");

describe("AddSaleScreen", () => {
  beforeEach(() => {});

  afterEach(() => {
    // Clean up on exiting
    cleanup();
    jest.clearAllMocks(); // Clear all mocks
  });

  it("should change selected expense type and receiving user state accordingly to isReceivingUser", () => {
    const types = [
      { id: 1, name: "Expense Type 1", isReceivingUser: true, defaultTags: [] },
      {
        id: 2,
        name: "Expense Type 2",
        isReceivingUser: false,
        defaultTags: [],
      },
    ];
    const sale = {
      amount: 23,
      tags: [],
      user: { id: "1" },
      date: new Date(),
    } as Sale;
    const { getByTestId } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(expenseTypesState, types)}
      >
        <PaperProvider>
          <AddSaleScreen
            route={{ params: { isEditMode: true, sale: sale } }}
            navigation={null}
          />
        </PaperProvider>
      </RecoilRoot>,
    );

    expect(getByTestId("Amount").props.value).toEqual("23");
  });

  it("calls SaleService.addSale with correct parameters when adding new sale", async () => {
    // Mock data
    const mockSale = {} as Sale;

    // Mock route params
    const mockNavigation = {
      goBack: jest.fn(),
    } as unknown as NavigationProp<ParamListBase>;
    const users = [{ id: "1" }] as User[];

    // Render component
    const { getByTestId, getByText } = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(usersState, users)}
      >
        <PaperProvider>
          <AddSaleScreen
            navigation={mockNavigation}
            route={{ params: { isEditMode: false, sale: null } }}
          />
        </PaperProvider>
      </RecoilRoot>,
    );
    const userSelectDropdown = getByTestId("user-picker");

    fireEvent(userSelectDropdown, "setValue", "1");

    // Fill input fields
    fireEvent.changeText(getByTestId("Priceperunit"), "2.394");
    fireEvent.changeText(getByTestId("Quantity"), "2.27");

    // Mock WorkService.addWork implementation
    (
      SaleService.addSale as jest.MockedFunction<typeof SaleService.addSale>
    ).mockResolvedValueOnce(mockSale);

    // Submit form
    fireEvent.press(getByText("Add Sale"));

    // Assertion
    await waitFor(() => {
      expect(SaleService.addSale).toHaveBeenCalledWith({
        date: expect.any(Date),
        quantity: 2.27,
        pricePerUnit: 2.394,
        amount: 5.43,
        user: { id: "1" },
        tags: [],
        description: "",
      });
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});
