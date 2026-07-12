# Promocean

## 프로젝트 요약

사장과 직원 모두를 위한 알바 관리 공간입니다. 스케줄 확인, 출퇴근 등록, 급여 확인까지 한눈에, 한 손에 확인할 수 있는 알바 관리 앱입니다.

이 문서는 프론트엔드 프로젝트 중 `app/login`, `app/myPage`, `app/payslip`과 해당 기능에서 사용하는 API·컴포넌트, 그리고 `constants`의 공통 디자인 리소스를 중심으로 작성했습니다.

## 주요 기능

### 1. 로그인 및 회원가입

- 이메일과 비밀번호를 이용한 로그인
- JWT의 사용자 역할(`EMPLOYER`, `EMPLOYEE`)을 판별해 사장/직원 메인 화면으로 분기
- 이메일, 비밀번호, 인적 사항, 계좌 정보로 이어지는 단계별 회원가입
- 이메일 형식과 비밀번호 복잡도 및 일치 여부를 실시간으로 검증하고 입력 조건이 충족된 경우에만 다음 단계 활성화
- Zustand 전역 스토어에 단계별 입력값을 병합해 화면 이동 후에도 작성 내용 유지
- 1원 송금 내역의 인증 문구를 확인하는 계좌 인증 지원
- 계좌 등록을 원하지 않는 사용자는 계좌 입력 없이 회원가입 완료 가능

### 2. 마이페이지

- 로그인 시 조회한 회원 정보와 역할에 맞는 프로필 및 캐릭터 표시
- 이름, 전화번호, 나이대, 성별 등 회원 정보 수정
- 계좌가 등록된 경우 계좌 카드 표시, 미등록 상태에서는 계좌 등록 화면으로 연결하는 빈 상태 UI 제공
- 1원 송금 인증을 통한 입금 계좌 등록 및 수정
- Keychain의 인증 토큰을 제거하는 로그아웃
- 확인 화면을 거친 회원 탈퇴 및 완료 화면 제공

### 3. 급여명세서

- 사장과 직원의 권한에 따라 서로 다른 급여명세서 목록 제공
- 사장은 사업장, 연도·월, 직원별로 급여명세서 조회 및 필터링
- 직원은 근무 사업장과 연도별로 본인의 급여명세서 조회
- JWT 역할을 확인해 다른 역할의 급여 화면 접근 방지
- 급여명세서 상세 화면에서 기본급, 주휴수당, 연장·야간수당, 상여금 등 지급 항목과 보험료, 연금, 소득세 등 공제 항목 표시
- 사업장 미등록, 명세서 없음, 로딩, API 오류를 구분한 상태별 UI 제공
- 사업장·기간 선택값이 바뀌면 커스텀 훅의 의존성을 통해 목록을 다시 조회

### 4. 공통 UI 및 디자인 시스템

- 하단 액션 버튼, 입력창, 전화번호 입력, 은행·나이대 드롭다운, 계좌 인증 모달 등 반복 UI를 컴포넌트화
- 색상, 폰트, 글자 크기, 마스코트 이미지를 `constants`에서 관리해 화면 간 디자인 일관성 확보
- Safe Area와 반응형 여백을 적용해 모바일 기기의 상태 바 및 홈 인디케이터 영역 대응

## 기술 스택

| 구분 | 기술 | 활용 내용 |
| --- | --- | --- |
| Language | TypeScript | API 요청·응답 및 컴포넌트 Props 타입 정의 |
| Styling | CSS, React Native StyleSheet | 모바일 화면 레이아웃과 공통 디자인 토큰 적용 |
| App | React Native, Expo | 크로스 플랫폼 모바일 UI와 파일 기반 라우팅 구성 |
| HTTP Client | Axios | 백엔드 및 금융 API 통신, 인증 헤더 처리 |
| State Management | Zustand | 회원가입 단계별 폼과 로그인 회원 정보 공유 |
| Authentication | JWT, react-native-keychain | 역할 판별 및 네이티브 보안 저장소에 토큰 보관 |

## 이슈와 해결

### 1. 선택 입력인 계좌를 등록하지 않으면 회원가입이 완료되지 않는 문제

**이슈**

계좌 정보는 선택 사항이지만, 계좌 인증을 건너뛰면 회원가입 요청 객체에 계좌 관련 필드가 존재하지 않아 가입 요청이 실패했습니다. 단계별 폼 상태만 그대로 서버에 전송했기 때문에 선택 흐름과 API 요청 형식 사이에 차이가 있었습니다.

**해결**

가입 완료 시점에 기존 Zustand 폼을 복사한 뒤 미입력 계좌 필드를 빈 문자열로 명시하고 FCM 토큰을 함께 포함한 최종 payload를 만들었습니다. 계좌 인증 여부와 무관하게 서버가 기대하는 요청 형태를 유지할 수 있게 했습니다.

참조 코드: `app/login/SignUpThird.tsx`  
수정 기록: `5132f24` (`fix : 회원 가입 통장 미입력시 가입 안되는 문제 해결`)

```tsx
const fcmtoken = await getFcmToken();
const payload = {
  ...signUpStore.registerForm,
  accountPassword: "",
  account: "",
  token: fcmtoken,
};

await registerMember(payload);
signUpStore.resetForm();
router.push("/login/SignUpComplete");
```

### 2. 회원 정보 수정 시 전화번호 구분자가 데이터에 섞이는 문제

**이슈**

화면에 표시된 전화번호에 `-`가 포함되어 있으면 수정 과정에서도 구분자가 상태값에 남아 숫자만 기대하는 API 데이터 형식과 일치하지 않을 수 있었습니다. 모바일 환경에서도 문자 키보드가 열려 불필요한 문자가 입력될 여지가 있었습니다.

**해결**

공통 전화번호 컴포넌트의 표시값과 변경 콜백 양쪽에서 하이픈을 제거하고 숫자 키보드를 지정했습니다. 화면별로 정제 로직을 반복하지 않고 입력 경계에서 항상 동일한 형태의 값이 전달되도록 했습니다.

참조 코드: `components/TextInput/PhoneNumInput.tsx`  
수정 기록: `383394e` (`style : 내 정보 수정시 핸드폰 번호에 -가 안붙도록 조정`)

```tsx
<TextInput
  value={phoneLastNum.replaceAll("-", "")}
  onChangeText={(value) =>
    onChangePhonLastNum(value.replaceAll("-", ""))
  }
  keyboardType="numeric"
/>
```

### 3. 급여명세서 상세 이동과 비동기 조회 상태가 불명확한 문제

**이슈**

사장용 목록에서 상세 화면의 이전 경로를 사용해 이동이 어긋났고, API 조회 중·실패·데이터 없음 상태가 단순 텍스트로만 처리되어 사용자가 현재 상태를 구분하기 어려웠습니다. 사업장과 명세서 식별자를 상세 화면까지 안정적으로 전달할 필요도 있었습니다.

**해결**

사장과 직원 화면 모두 공통 상세 경로인 `/payslip/common/PayslipDetail`을 사용하고 `payslipId`, `storeId`를 라우트 파라미터로 전달했습니다. 상세 화면에서는 파라미터로 커스텀 훅을 호출하며 로딩, 오류, 빈 데이터, 정상 데이터를 분기해 렌더링했습니다. 목록 화면에도 사업장 없음과 급여명세서 없음 상태를 별도로 제공했습니다.

참조 코드: `app/payslip/employer/PayslipListOwner.tsx`, `app/payslip/common/PayslipDetail.tsx`, `app/payslip/common/hooks/usePayslipDetail.ts`  
수정 기록: `e1f5c4b` (`fix: 급여명세서 라우터 조절`), `1646b7b` (`style : 직원 급여 명세서 급여명세서 없는 경우의 UI 추가`)

```tsx
const handlePayslipPress = (payslipId: number, storeId: number) => {
  router.push({
    pathname: "/payslip/common/PayslipDetail",
    params: { payslipId, storeId },
  });
};

const { data: payslipData, loading, error } = usePayslipDetail({
  payslipId: Number(payslipId),
  storeId: Number(storeId),
});

if (loading) return <ActivityIndicator />;
if (error) return <Text>데이터 불러오기 실패</Text>;
if (!payslipData) return <Text>데이터 없음</Text>;
```

### 4. 여러 화면에서 공유해야 하는 회원가입 정보와 로그인 사용자 정보

**이슈**

회원가입이 여러 화면으로 분리되어 있어 각 화면의 로컬 상태만 사용하면 다음 단계 이동이나 뒤로 가기에서 입력 내용이 유실될 수 있었습니다. 로그인 후에도 마이페이지와 내비게이션 등 여러 위치에서 동일한 회원 정보와 역할이 필요했습니다.

**해결**

회원가입 정보와 로그인 회원 정보를 각각 Zustand 스토어로 분리했습니다. `Partial<T>`를 받는 `setForm`이 기존 객체와 새 값을 병합하게 구성해 각 화면은 자신이 담당하는 필드만 갱신하고, 가입 완료·로그아웃 시에는 `resetForm`으로 상태를 정리할 수 있게 했습니다.

참조 코드: `store/useSignUpStore.ts`, `store/useMemberStore.ts`

```ts
setForm: (partial) =>
  set((state) => ({
    registerForm: { ...state.registerForm, ...partial },
  })),
resetForm: () => set({ registerForm: {} as RegisterRequest }),
```
