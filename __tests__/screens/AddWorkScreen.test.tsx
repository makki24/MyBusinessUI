import fetchMock from "jest-fetch-mock";
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import AddWorkScreen from "../../screens/AddWorkScreen";
import { WorkType } from "../../types";
import WorkService from "../../services/WorkService";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
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

jest.mock("../../services/WorkService");

describe("AddWorkScreen", () => {
  beforeEach(() => {});

  afterEach(() => {
    // Clean up on exiting
    cleanup();
    jest.clearAllMocks(); // Clear all mocks
  });

  it("calls WorkService.addWork with correct parameters when adding new work", async () => {
    // Mock data
    const mockWork = {
      id: 1,
      date: new Date(),
      type: "mockType",
      quantity: 10,
      pricePerUnit: 5,
      amount: 50,
      description: "Mock work",
      user: { id: "mockUserId" },
      tags: [{ id: 1 }, { id: 2 }],
    };

    // Mock route params
    const mockNavigation = {
      goBack: jest.fn(),
    } as unknown as NavigationProp<ParamListBase>;
    const mockRouteParams = {
      params: {
        isEditMode: false,
        workType: { pricePerUnit: 5.39 } as WorkType, // Mocking the pricePerUnit for workType
        work: null,
        tags: [],
      },
    };

    // Render component
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <AddWorkScreen navigation={mockNavigation} route={mockRouteParams} />
        </PaperProvider>
      </RecoilRoot>,
    );
    const userSelectDropdown = getByTestId("user-select");

    fireEvent(userSelectDropdown, "onChangeValue", "1");
    // fireEvent(userSelectDropdown, 'handleUserChange', "1");

    // Fill input fields
    fireEvent.changeText(getByTestId("Quantity"), "10.73");

    // Mock WorkService.addWork implementation
    (
      WorkService.addWork as jest.MockedFunction<typeof WorkService.addWork>
    ).mockResolvedValueOnce(mockWork);

    // Submit form
    fireEvent.press(getByText("Add Work"));

    // Assertion
    await waitFor(() => {
      expect(WorkService.addWork).toHaveBeenCalledWith({
        date: expect.any(Date),
        type: { pricePerUnit: 5.39 } as WorkType,
        quantity: 10.73,
        pricePerUnit: 5.39, // Mocked pricePerUnit from workType
        amount: 57.8347,
        user: { id: "1" },
        tags: [],
        description: "",
      });
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  }, 10000);

  it("calls WorkService.addWork with correct parameters when adding new work enter amount directly", async () => {
    // Mock data
    const mockWork = {
      id: 1,
      date: new Date(),
      type: "mockType",
      quantity: 10,
      pricePerUnit: 5,
      amount: 50,
      description: "Mock work",
      user: { id: "mockUserId" },
      tags: [{ id: 1 }, { id: 2 }],
    };

    // Mock route params
    const mockNavigation = {
      goBack: jest.fn(),
    } as unknown as NavigationProp<ParamListBase>;
    const mockRouteParams = {
      params: {
        isEditMode: false,
        workType: { pricePerUnit: 5 } as WorkType, // Mocking the pricePerUnit for workType
        work: null,
        tags: [],
      },
    };

    // Render component
    const { getByTestId, getByText } = render(
      <RecoilRoot>
        <PaperProvider>
          <AddWorkScreen navigation={mockNavigation} route={mockRouteParams} />
        </PaperProvider>
      </RecoilRoot>,
    );
    const userSelectDropdown = getByTestId("user-select");

    fireEvent(userSelectDropdown, "onChangeValue", "1");
    // fireEvent(userSelectDropdown, 'handleUserChange', "1");

    // Fill input fields
    fireEvent.changeText(getByTestId("Quantity"), "10");

    fireEvent(getByText("Enter amount directly"), "onValueChange", true);
    fireEvent.changeText(getByTestId("Amount"), "92");

    // Mock WorkService.addWork implementation
    (
      WorkService.addWork as jest.MockedFunction<typeof WorkService.addWork>
    ).mockResolvedValueOnce(mockWork);

    // Submit form
    fireEvent.press(getByText("Add Work"));

    // Assertion
    await waitFor(() => {
      expect(WorkService.addWork).toHaveBeenCalledWith({
        date: expect.any(Date),
        type: { pricePerUnit: 5 } as WorkType,
        quantity: 1,
        pricePerUnit: 92, // Mocked pricePerUnit from workType
        amount: 92,
        user: { id: "1" },
        tags: [],
        description: "",
      });
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});
