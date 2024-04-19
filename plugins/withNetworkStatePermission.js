/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable  no-undef */

const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withNetworkStatePermission(config) {
  return withAndroidManifest(config, async (exportedConfigWithProps) => {
    let androidManifest = exportedConfigWithProps.modResults.manifest;
    // Add the permission to the manifest
    androidManifest["uses-permission"] = [
      ...(androidManifest["uses-permission"] || []),
      { $: { "android:name": "android.permission.ACCESS_NETWORK_STATE" } },
    ];
    return exportedConfigWithProps;
  });
};
