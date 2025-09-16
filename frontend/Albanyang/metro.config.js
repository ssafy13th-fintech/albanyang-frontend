// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// expo/metro-config에서 기본 Metro 설정을 가져옵니다.
const config = getDefaultConfig(__dirname);

// 모노레포(monorepo) 구조인 경우, 상위 폴더의 패키지를 인식하도록 설정
// 필요한 경우에만 추가
config.watchFolders = [
  path.resolve(__dirname, '..', '..')
];

module.exports = config;