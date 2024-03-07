/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable  no-undef */

const { withAndroidManifest } = require("@expo/config-plugins");

const withCustomConfig = (config) => {
  return withAndroidManifest(config, async (config) => {
    // Make sure the main application in the Android Manifest exists
    if (!Array.isArray(config.modResults.manifest.application)) {
      config.modResults.manifest.application = [];
    }
    let mainApplication = config.modResults.manifest.application.filter(
      (e) => e["$"]["android:name"] === ".MainApplication",
    )[0];

    // Ensure it has an android:usesCleartextTraffic property
    if (!mainApplication["$"]["android:usesCleartextTraffic"]) {
      mainApplication["$"]["android:usesCleartextTraffic"] = "true";
    }

    return config;
  });
};

module.exports = withCustomConfig;
