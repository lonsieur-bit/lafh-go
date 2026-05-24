const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { resolve } = require("metro-resolver");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Monorepo: root has React 18 (Vite); mobile uses React 19 — one copy or hooks break.
const mobileModules = path.resolve(projectRoot, "node_modules");
const mobileEntry = path.join(projectRoot, "index.ts");
const reactPkgs = new Set(["react", "react-dom"]);

config.resolver.extraNodeModules = {
  react: path.join(mobileModules, "react"),
  "react-dom": path.join(mobileModules, "react-dom"),
};

const rootReactBlock = new RegExp(
  `${path.resolve(workspaceRoot, "node_modules", "react").replace(/\\/g, "/")}/.*`,
);

config.resolver.blockList = [
  /apps[\\/]admin[\\/].*/,
  /[\\/]\.vite[\\/].*/,
  rootReactBlock,
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (reactPkgs.has(moduleName) || moduleName.startsWith("react/") || moduleName.startsWith("react-dom/")) {
    return resolve({ ...context, originModulePath: mobileEntry }, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

if (!config.resolver.sourceExts.includes("mjs")) {
  config.resolver.sourceExts.push("mjs");
}

module.exports = withNativeWind(config, {
  input: "./global.css",
});
