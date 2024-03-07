const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withNetworkStatePermission(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;
    // Add the permission to the manifest
    androidManifest["uses-permission"] = [
      ...(androidManifest["uses-permission"] || []),
      { $: { "android:name": "android.permission.ACCESS_NETWORK_STATE" } },
    ];
    return config;
  });
};
