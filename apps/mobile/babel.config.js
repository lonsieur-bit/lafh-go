module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        require.resolve("babel-preset-expo"),
        { jsxImportSource: "nativewind", unstable_transformImportMeta: true },
      ],
      require.resolve("nativewind/babel"),
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
            "@luffa/shared": "../../packages/shared/src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
