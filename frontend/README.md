# My Expo App

이 프로젝트는 Expo를 사용한 React Native 프로젝트로, Docker를 활용하거나 로컬 환경에서 설정하여 팀원 간 일관된 개발 환경을 제공합니다. 아래 지침을 따라 프로젝트를 설정하고 실행하세요.

## 명령어 간단 요약
- **저장소 클론**:
  ```bash
  git clone <저장소-URL>
  cd Albanyang
  ```
- **Docker Compose로 실행**:
  ```bash
  docker-compose up --build
  ```
- **Docker 직접 실행**:
  ```bash
  docker build -t Albanyang .
  docker run -it -p 19000:19000 -p 19001:19001 -p 19002:19002 -v $(pwd):/app Albanyang
  ```
- **로컬 실행**:
  ```bash
  npm install
  npx expo start --tunnel
  ```
- **컨테이너 중지**:
  ```bash
  docker-compose down
  ```

## 필수 조건
- **Docker** (Docker 사용 시): [Docker Desktop](https://www.docker.com/products/docker-desktop/)을 설치하고 `docker --version`으로 확인하세요.
- **Git**: 저장소를 클론하려면 Git이 설치되어 있어야 합니다.
- **Node.js** (로컬 사용 시): Node.js 22.19.0 설치 ([Node.js 공식 사이트](https://nodejs.org/)).
- **Expo Go 앱** (선택): 모바일 디바이스(iOS/Android)에서 테스트하려면 설치하세요.

## 설정 방법

### 1. 저장소 클론
프로젝트를 로컬 머신에 클론합니다:
```bash
git clone <저장소-URL>
cd Albanyang
```

### 2. Docker를 사용한 설정 (권장)
Docker를 사용해 의존성과 버전 충돌을 관리합니다.

#### 방법 1: Docker Compose 사용
1. 프로젝트 루트에 `docker-compose.yml` 파일이 있는지 확인하세요.
2. Docker 컨테이너를 빌드하고 실행합니다:
   ```bash
   docker-compose up --build
   ```
3. 브라우저에서 `http://localhost:19002`를 열어 Expo DevTools에 접근하세요.
4. QR 코드를 Expo Go 앱으로 스캔하거나 에뮬레이터로 앱을 테스트하세요.

#### 방법 2: Docker 직접 실행
1. Docker 이미지를 빌드합니다:
   ```bash
   docker build -t Albanyang .
   ```
2. 컨테이너를 실행합니다:
   ```bash
   docker run -it -p 19000:19000 -p 19001:19001 -p 19002:19002 -v $(pwd):/app Albanyang
   ```
3. `http://localhost:19002`에서 Expo DevTools를 확인하세요.

### 3. 로컬 환경에서 직접 설정
Docker를 사용하지 않고 로컬에서 설정하려면, 모든 팀원이 아래 버전을 설치하여 환경을 통일하세요.

#### 필수 설치 및 버전 고정
1. **Node.js 설치**:
   - Node.js 22.19.0을 설치하세요 ([Node.js 공식 사이트](https://nodejs.org/)).
   - 확인: `node -v` (출력: `v22.19.0`).
   - 추천: `nvm` (Node Version Manager) 사용 (`nvm install 22.19.0 && nvm use 22.19.0`).
2. **npm 설치**:
   - npm 11.6.0으로 업그레이드: `npm install -g npm@11.6.0`.
   - 확인: `npm -v` (출력: `11.6.0`).
3. **Expo CLI 설치**:
   - `npm install -g expo-cli@0.24.21`.
   - 확인: `expo --version` (출력: `0.24.21`).
4. **에뮬레이터 설정 (선택)**:
   - Android: Android Studio 설치 후 에뮬레이터 설정.
   - iOS (macOS 전용): Xcode 설치 후 시뮬레이터 설정.

#### 실행 단계
1. 의존성 설치: `npm install` (package-lock.json 기반으로 Expo 53.0.22, React 19.0.0, React Native 0.79.6 설치).
2. 앱 실행: `npx expo start --tunnel`.
3. Expo DevTools: 브라우저에서 `http://localhost:19002`. QR 코드 스캔으로 Expo Go 앱 테스트.
4. 버전 확인:
   ```bash
   npm run check-versions
   ```
   `package.json`에 아래 스크립트 추가:
   ```json
   "scripts": {
     "check-versions": "echo 'Node: $(node -v)' && echo 'npm: $(npm -v)' && echo 'Expo CLI: $(expo --version)' && npm list expo react react-native"
   }
   ```

### 4. 앱 테스트
- QR 코드를 Expo Go 앱으로 스캔하여 앱을 테스트하세요.
- 또는 로컬 에뮬레이터(Android/iOS)를 사용하세요. Docker에서 Android 에뮬레이터는 추가 설정이 필요합니다(고급 설정 참조).

![image](/expo_success_build.jpg)

### 5. 프로젝트 구조
- `Dockerfile`: Node.js 및 Expo 환경을 정의합니다 (루트 디렉토리).
- `docker-compose.yml`: 컨테이너를 쉽게 관리합니다 (루트 디렉토리).
- `.dockerignore`: 불필요한 파일(예: `node_modules`)을 빌드에서 제외합니다.
- `package.json`: 프로젝트 의존성을 고정된 버전으로 관리합니다 (예: Expo 53.0.22, React 19.0.0, React Native 0.79.6).
- `package-lock.json`: 의존성 버전을 고정합니다.

## 개발 워크플로우
- **Docker**:
  - 앱 시작: `docker-compose up`.
  - 코드 수정: 로컬 파일 수정 시 컨테이너에 자동 동기화.
  - 의존성 추가: `package.json` 수정 후 `docker-compose up --build --no-cache`.
  - 컨테이너 중지: `Ctrl+C` 또는 `docker-compose down`.
- **로컬**:
  - 앱 시작: `npx expo start --tunnel`.
  - 의존성 추가: `npm install --save-exact <package>@<version>` 후 `npm install`.
- **버전 확인**: `npm run check-versions`로 Node.js, npm, Expo CLI, 의존성 버전 확인.

## 고급 설정
- **버전 관리**: `package.json`에 정확한 버전(예: `"expo": "53.0.22"`)을 지정하고, `package-lock.json`을 커밋하여 충돌 방지.
- **포트 충돌**: `19000-19002` 포트가 사용 중이면 `docker-compose.yml` 또는 로컬 실행 시 포트 변경 (예: `-p 19003:19000`).
- **Android 에뮬레이터**: Docker 사용 시 `circleci/android:api-30-node` 이미지로 Dockerfile 확장. 로컬은 Android Studio 설치.
- **EAS 빌드**: 프로덕션 빌드는 `eas build` 사용 (로컬 SDK 설치 불필요).

## 문제 해결
- **Docker 빌드 실패**: `Dockerfile`의 의존성 또는 문법 오류 확인.
- **앱 로드 안 됨**: `--tunnel` 옵션 사용 (`npx expo start --tunnel`).
- **파일 권한 문제**: Linux에서 `chown`으로 권한 조정.
- **로컬 버전 불일치**: `npm ci`로 `package-lock.json` 기반 설치.

## 팀 가이드라인
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `package.json`, `package-lock.json`을 저장소에 커밋.
- API 키 등 환경 변수는 `.env` 파일에 저장하고 `.gitignore`에 추가.
- 작업 전 `git pull`로 최신 코드 동기화.

추가 도움이 필요하면 팀 리더에게 문의하거나 [Expo 문서](https://docs.expo.dev/)를 참고하세요.