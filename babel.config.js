module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          // Sửa: Đặt root là thư mục gốc của dự án
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            // Giữ nguyên các alias trỏ vào src/
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@types': './src/types',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@api': './src/api',
            '@navigation': './src/navigation',
          },
        },
      ],
      ['module:react-native-dotenv', {
        "moduleName": "@env",
        "path": ".env",
        "safe": false,
        "allowUndefined": true
      }],
      'react-native-reanimated/plugin',
    ],
  };
};