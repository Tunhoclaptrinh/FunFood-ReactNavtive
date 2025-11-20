const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Loại ttf và png khỏi sourceExts
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  ext => ext !== "ttf" && ext !== "png"
);

// Đảm bảo ttf và png nằm trong assetExts
["ttf", "png"].forEach(ext => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

module.exports = config;
