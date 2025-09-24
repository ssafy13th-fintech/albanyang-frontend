module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './'   // 프로젝트 루트(당신의 경우: frontend/Albanyang) 아래 파일을 @로 접근
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json']
        },
        'react-native-reanimated/plugin', // 반드시 마지막에
      ]
    ],
  };
};
