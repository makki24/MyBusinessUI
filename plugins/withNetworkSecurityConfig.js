/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable  no-undef */

const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");
const { Paths } = require("@expo/config-plugins/build/android");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

const withNetworkSecurityConfig = (config) => {
  return withAndroidManifest(config, async (exportedConfigWithProps) => {
    exportedConfigWithProps.modResults = await setCustomConfigAsync(
      exportedConfigWithProps,
      exportedConfigWithProps.modResults,
    );
    return exportedConfigWithProps;
  });
};

async function setCustomConfigAsync(config, androidManifest) {
  const src_file_path = path.join(
    __dirname,
    "..",
    "plugins",
    "network_security_config.xml",
  );
  const res_file_path = path.join(
    await Paths.getResourceFolderAsync(config.modRequest.projectRoot),
    "xml",
    "network_security_config.xml",
  );
  const res_dir = path.resolve(res_file_path, "..");
  if (!fs.existsSync(res_dir)) {
    await fsPromises.mkdir(res_dir);
  }
  await fsPromises.copyFile(src_file_path, res_file_path);
  const mainApplication = getMainApplicationOrThrow(androidManifest);
  mainApplication.$["android:networkSecurityConfig"] =
    "@xml/network_security_config";
  return androidManifest;
}

module.exports = withNetworkSecurityConfig;
