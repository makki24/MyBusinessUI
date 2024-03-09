/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable  no-undef */

const { withAndroidManifest } = require("@expo/config-plugins");

const withCustomConfig = (config) => {
  return withAndroidManifest(config, async (exportedConfigWithProps) => {
    // Make sure the main application in the Android Manifest exists
    if (
      !Array.isArray(exportedConfigWithProps.modResults.manifest.application)
    ) {
      exportedConfigWithProps.modResults.manifest.application = [];
    }
    let mainApplication =
      exportedConfigWithProps.modResults.manifest.application.filter(
        (e) => e["$"]["android:name"] === ".MainApplication",
      )[0];

    // Ensure it has an android:usesCleartextTraffic property
    if (!mainApplication["$"]["android:usesCleartextTraffic"]) {
      mainApplication["$"]["android:usesCleartextTraffic"] = "true";
    }

    return exportedConfigWithProps;
  });
};

module.exports = withCustomConfig;
