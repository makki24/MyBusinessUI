/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import { RecoilRoot } from "recoil";
import { PaperProvider } from "react-native-paper";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import SearchAndFilter from "../../components/common/SearchAndFilter";
import { Filter } from "../../types";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Track the onChange callback that SearchAndFilter registers on the BottomSheetModal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockCapturedOnChange: any = null;
const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RN = require("react");
  const { View } = require("react-native");

  // eslint-disable-next-line react/display-name
  const BottomSheetModal = RN.forwardRef(
    (props: Record<string, unknown>, ref: unknown) => {
      // Capture the onChange prop so tests can simulate open/close
      mockCapturedOnChange = props.onChange || null;

      RN.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));

      return (
        <View testID="bottom-sheet-modal">{props.children as undefined}</View>
      );
    },
  );

  // eslint-disable-next-line react/display-name
  const BMProvider = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );

  // eslint-disable-next-line react/display-name
  const BSScrollView = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );

  return {
    BottomSheetModal,
    BottomSheetModalProvider: BMProvider,
    BottomSheetScrollView: BSScrollView,
  };
});

jest.mock("../../components/CustomBackDrop", () => {
  const { View } = require("react-native");
  // eslint-disable-next-line react/display-name
  return () => <View testID="backdrop" />;
});

jest.mock("../../components/common/FilterScreen", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  // eslint-disable-next-line react/display-name
  return (props: { onApply: (filter: Filter) => void }) => (
    <View testID="filter-screen">
      <TouchableOpacity
        testID="apply-filter-btn"
        onPress={() =>
          props.onApply({
            sender: [],
            receiver: [],
            user: [],
            tags: [],
            fromDate: undefined,
            toDate: undefined,
          })
        }
      >
        <Text>Apply</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

// ── Test helpers ─────────────────────────────────────────────────────────────

const defaultProps = {
  handleSearch: jest.fn(),
  user: [],
  sender: [],
  receiver: [],
  type: [],
  onApply: jest.fn(),
  filter: true,
};

const renderComponent = (overrides = {}) =>
  render(
    <RecoilRoot>
      <PaperProvider>
        <BottomSheetModalProvider>
          <SearchAndFilter {...defaultProps} {...overrides} />
        </BottomSheetModalProvider>
      </PaperProvider>
    </RecoilRoot>,
  );

// ── Tests ────────────────────────────────────────────────────────────────────

describe("<SearchAndFilter /> – BackHandler lifecycle", () => {
  let addListenerSpy: jest.SpyInstance;
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturedOnChange = null;

    // Spy on BackHandler.addEventListener and return a removable subscription
    addListenerSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue({ remove: mockRemove } as ReturnType<
        typeof BackHandler.addEventListener
      >);
  });

  afterEach(cleanup);

  it("does NOT register a BackHandler listener on initial render", () => {
    renderComponent();

    expect(addListenerSpy).not.toHaveBeenCalled();
  });

  it("registers BackHandler when the sheet opens (onChange index >= 0)", () => {
    renderComponent();

    expect(mockCapturedOnChange).toBeTruthy();

    // Simulate sheet opening
    act(() => {
      mockCapturedOnChange!(0);
    });

    expect(addListenerSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );
  });

  it("removes BackHandler when the sheet closes (onChange index === -1)", () => {
    renderComponent();

    // Open the sheet
    act(() => {
      mockCapturedOnChange!(0);
    });

    expect(addListenerSpy).toHaveBeenCalledTimes(1);

    // Close the sheet
    act(() => {
      mockCapturedOnChange!(-1);
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("calls dismiss on the ref when hardware back is pressed while open", () => {
    renderComponent();

    // Open the sheet
    act(() => {
      mockCapturedOnChange!(0);
    });

    // Get the handler that was registered
    const handler = addListenerSpy.mock.calls[0][1];
    const result = handler();

    expect(mockDismiss).toHaveBeenCalled();
    expect(result).toBe(true); // Should block default back navigation
  });

  it("does NOT leave a stale listener after sheet close + reopen", () => {
    renderComponent();

    // Open
    act(() => {
      mockCapturedOnChange!(0);
    });
    expect(addListenerSpy).toHaveBeenCalledTimes(1);

    // Close – should clean up
    act(() => {
      mockCapturedOnChange!(-1);
    });
    expect(mockRemove).toHaveBeenCalledTimes(1);

    // Reopen – should register a fresh listener
    act(() => {
      mockCapturedOnChange!(0);
    });
    expect(addListenerSpy).toHaveBeenCalledTimes(2);
  });

  it("cleans up BackHandler on unmount while sheet is open", () => {
    const { unmount } = renderComponent();

    // Open the sheet
    act(() => {
      mockCapturedOnChange!(0);
    });

    expect(addListenerSpy).toHaveBeenCalledTimes(1);

    // Unmount while sheet is still open
    unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
