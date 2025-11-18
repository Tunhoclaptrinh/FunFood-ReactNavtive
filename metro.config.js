/**
 * metro.config.js
 * Metro config chuẩn cho React Native + TypeScript
 */
const { getDefaultConfig } = require("metro-config");

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      /* Nếu muốn, bạn có thể thêm các alias path giống tsconfig.json */
      /* extraNodeModules: {
           '@': path.resolve(__dirname, 'src')
         },
      */
    },
    transformer: {
      ...defaultConfig.transformer,
    },
  };
})();
