jest.setMock("node-fetch", require("jest-fetch-mock"));

jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    mergeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    flushGetRequests: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiMerge: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
    setNotificationHandler: jest.fn(),
    getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    removeNotificationSubscription: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
}));

jest.mock("expo-linear-gradient", () => ({
    LinearGradient: ({ children }: any) => children,
}));

jest.mock("@expo/vector-icons", () => ({
    MaterialCommunityIcons: "MaterialCommunityIcons",
}));

jest.mock("expo-linking", () => ({
    createURL: jest.fn(),
    useLinkTo: jest.fn(() => jest.fn()),
}));

jest.mock("@react-native-firebase/crashlytics", () => () => ({
    recordError: jest.fn(),
    log: jest.fn(),
}));
