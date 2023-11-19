import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: "MyBusinessUI",
        slug: "MyBusinessUI",
        "android": {
            "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
            "adaptiveIcon": {
                "foregroundImage": "./assets/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            "package": "com.syedsons.mybusiness"
        },
    };
};
