const { withAppDelegate, createRunOncePlugin } = require("@expo/config-plugins");

const MARKER = "luffa-arabic-locale";

/**
 * Prefer Arabic for MapKit / system strings when the device UI is English.
 * Requires a development or production build (not applied in Expo Go).
 */
function withArabicAppLocale(config) {
  return withAppDelegate(config, (config) => {
    const { modResults } = config;
    if (modResults.contents.includes(MARKER)) {
      return config;
    }

    if (modResults.language === "swift") {
      modResults.contents = modResults.contents.replace(
        /(didFinishLaunchingWithOptions[^{]+\{)/,
        `$1\n    // ${MARKER}\n    UserDefaults.standard.set(["ar", "en"], forKey: "AppleLanguages")\n`,
      );
      return config;
    }

    if (modResults.language === "objcpp" || modResults.language === "objc") {
      modResults.contents = modResults.contents.replace(
        /(didFinishLaunchingWithOptions:[^{]+\{)/,
        `$1\n  // ${MARKER}\n  [[NSUserDefaults standardUserDefaults] setObject:@[@"ar", @"en"] forKey:@"AppleLanguages"];\n`,
      );
    }

    return config;
  });
}

module.exports = createRunOncePlugin(withArabicAppLocale, "with-arabic-app-locale");
