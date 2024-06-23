import { ExpoConfig, ConfigContext } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_QA = process.env.APP_VARIANT === "qa";

const ICON_PATH = IS_QA
  ? "./assets/app_qa.png"
  : IS_DEV
    ? "./assets/icon.png"
    : "./assets/app_production.png";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    icon: ICON_PATH,
    name: "MyBusinessUI",
    slug: "MyBusinessUI",
    android: {
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      adaptiveIcon: {
        foregroundImage: ICON_PATH,
        backgroundColor: "#ffffff",
      },
      package: IS_DEV
        ? "com.syedsons.mybusiness.dev"
        : IS_QA
          ? "com.syedsons.mybusiness.qa"
          : "com.syedsons.mybusiness",
    },
    updates: {
      url: process.env.EAS_UPDATE_URL,
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
  };
};
