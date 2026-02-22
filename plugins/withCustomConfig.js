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

    // Add intent filter for OAuth redirect handling
    // This enables the app to catch redirects like: com.syedsons.mybusiness.dev:/oauthredirect
    const mainActivity = mainApplication.activity?.find(
      (activity) => activity["$"]["android:name"] === ".MainActivity",
    );

    if (mainActivity) {
      // Ensure intent-filter array exists
      if (!mainActivity["intent-filter"]) {
        mainActivity["intent-filter"] = [];
      }

      // Get the package name from the config
      const packageName =
        exportedConfigWithProps.android?.package || "com.syedsons.mybusiness";

      // Add OAuth redirect intent filter
      const oauthIntentFilter = {
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        category: [
          { $: { "android:name": "android.intent.category.DEFAULT" } },
          { $: { "android:name": "android.intent.category.BROWSABLE" } },
        ],
        data: [
          {
            $: {
              "android:scheme": packageName,
              "android:path": "/oauthredirect",
            },
          },
        ],
      };

      // Check if this intent filter already exists to avoid duplicates
      const exists = mainActivity["intent-filter"].some(
        (filter) =>
          filter.data?.[0]?.["$"]?.["android:scheme"] === packageName &&
          filter.data?.[0]?.["$"]?.["android:path"] === "/oauthredirect",
      );

      if (!exists) {
        mainActivity["intent-filter"].push(oauthIntentFilter);
      }
    }

    return exportedConfigWithProps;
  });
};

module.exports = withCustomConfig;
