# Dockerfile
FROM node:22.19.0-alpine  

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 캐싱을 위해 package.json 먼저 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# Expo CLI 글로벌 설치 (필요 시)
RUN npm install -g expo-cli

# 나머지 소스 코드 복사
COPY . .

# Expo 서버 포트 노출 (Metro bundler 기본 포트)
EXPOSE 19000

# 기본 명령어: Expo 시작
CMD ["npx", "expo", "start", "--tunnel"]  # --tunnel 옵션으로 로컬 네트워크 문제 방지