/** @type {import('next').NextConfig} */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const nextConfig = {
  // Disable SWC minification so Cesium's ESM worker bundles are not parsed/minified,
  // which avoids "'import' and 'export' cannot be used outside of module code" errors.
  swcMinify: false,
  webpack: (config, { isServer }) => {
    // Ensure module/rules objects exist
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: "cesium",
    };

    // Exclude public directory from webpack processing
    // Files in public/ should be served as static assets, not processed
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/public/**", "**/node_modules/**"],
    };

    // Completely disable JS minimization; Cesium's ESM worker bundles are not compatible
    // with Terser/SWC minification in this environment.
    config.optimization = config.optimization || {};
    config.optimization.minimize = false;
    config.optimization.minimizer = [];

    // Treat Cesium worker bundles as static assets so build tools don't try to parse/minify them.
    // This prevents errors like "'import' and 'export' cannot be used outside of module code"
    // when Terser/SWC encounters Cesium's ESM worker chunks.
    config.module.rules.push({
      test: /chunk-.*\.js$/,
      include: [
        path.resolve(__dirname, "node_modules/cesium/Build/Cesium/Workers"),
        path.resolve(__dirname, "public/cesium/Workers"),
      ],
      type: "asset/source",
    });

    if (!isServer) {
      // Copy Cesium assets to public folder
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Workers"),
              to: path.join(__dirname, "public/cesium/Workers"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/ThirdParty"),
              to: path.join(__dirname, "public/cesium/ThirdParty"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Assets"),
              to: path.join(__dirname, "public/cesium/Assets"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Widgets"),
              to: path.join(__dirname, "public/cesium/Widgets"),
            },
          ],
        })
      );
    }

    return config;
  },
  env: {
    CESIUM_BASE_URL: "/cesium",
  },
  // Disable caching in development to prevent stale builds
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

