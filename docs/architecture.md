# 투자 수익 시뮬레이터 — 아키텍처 문서

## 1. 앱 분류 및 정체성

| 항목 | 내용 |
|------|------|
| 카테고리 | **비게임 — 일반 유틸리티/금융 시뮬레이터** |
| 상태 보관 | **없음 (Stateless)** |
| 서버/DB | **없음** |
| 등록 유형 | AppsInToss 일반 미니앱 (WebView 기반) |

> 이 앱은 사용자가 투자 조건을 입력하면 예상 수익을 계산해 보여주는 **일회성 계산기**입니다.
> 게임 카테고리가 아니므로 게임 전용 API(점수, 인벤토리, 퀘스트 등)는 일절 사용하지 않습니다.

---

## 2. 무상태(Stateless) 설계 원칙

### 2-1. 허용된 상태 관리
- **React State (`useState`)** : 현재 세션 내 UI 상태(입력값, 계산 결과, 화면 단계)만 관리
- 앱을 종료하면 모든 데이터가 초기화됩니다.

### 2-2. 절대 금지 항목
| 금지 항목 | 이유 |
|-----------|------|
| `localStorage` / `sessionStorage` | 영구/반영구 데이터 저장 → Stateless 원칙 위반 |
| `IndexedDB` | 클라이언트 측 DB → 동일 이유 |
| 외부 REST API / GraphQL | 백엔드 의존성 발생 |
| 서버리스 함수(AWS Lambda 등) | 서버 구성 요소 도입 금지 |
| 쿠키 기반 세션 | 상태 영속화 |

---

## 3. 프로젝트 구조

```
trade-sim/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── docs/
│   └── architecture.md          ← 이 문서
└── src/
    ├── main.tsx                  ← 진입점
    ├── App.tsx                   ← 라우팅/상위 상태
    ├── components/
    │   ├── InputForm.tsx         ← 투자 조건 입력 (거치식/적립식)
    │   ├── AdOverlay.tsx         ← 계산 중 전면 광고 Mock UI
    │   ├── ResultView.tsx        ← 시뮬레이션 결과 화면
    │   └── RewardButton.tsx      ← 토스 포인트 지급 버튼
    ├── hooks/
    │   └── useSimulation.ts      ← 투자 수익 계산 로직
    └── utils/
        └── tossPromoMock.ts      ← @apps-in-toss/web-framework 프로모션 API 모킹
```

---

## 4. 토스 일반 미니앱 보상/프로모션 API 연동 흐름

```
사용자 "토스 포인트 지급" 버튼 클릭
        │
        ▼
[1] tossPromoMock.getUserId()
    → 토스 앱으로부터 사용자 식별자(userId) 획득
    → 실제: @apps-in-toss/web-framework의 getUserInfo() 호출
        │
        ▼
[2] tossPromoMock.showRewardedAd()
    → 보상형 광고 시청 (30초 광고)
    → 광고 완료 콜백 수신
        │
        ▼
[3] tossPromoMock.grantPoint({ userId, amount })
    → 일반 미니앱 포인트 지급 API 호출
    → 실제: @apps-in-toss/web-framework의 requestPromotion() 또는 동등한 일반 API
        │
        ▼
[4] 결과 UI 업데이트 (React State)
    → "토스 포인트 N점이 지급되었습니다" 표시
    → localStorage 등 저장 없음 — 세션 종료 시 초기화
```

### 4-1. 사용 API 범위 (비게임 일반 미니앱)

| API | 용도 | 게임 전용 여부 |
|-----|------|---------------|
| `getUserInfo()` | 사용자 식별 | ❌ 일반 사용 가능 |
| `requestPromotion()` | 포인트/쿠폰 지급 요청 | ❌ 일반 사용 가능 |
| `showInterstitialAd()` | 전면 광고 표시 | ❌ 일반 사용 가능 |
| `showRewardedAd()` | 보상형 광고 시청 | ❌ 일반 사용 가능 |
| ~~`submitScore()`~~ | ~~게임 점수 제출~~ | ✅ 게임 전용 — **사용 금지** |
| ~~`openInventory()`~~ | ~~아이템 인벤토리~~ | ✅ 게임 전용 — **사용 금지** |

---

## 5. 화면 흐름(Screen Flow)

```
[InputForm]  →(계산 시작)→  [AdOverlay]  →(광고 완료)→  [ResultView]
    ↑                                                         │
    └──────────────────────(다시 계산)───────────────────────┘
```

1. **InputForm**: 투자 방식(거치식/적립식), 원금, 기간, 연 수익률 입력
2. **AdOverlay**: 계산 처리 중 전면 광고 Mock (1.5초 딜레이)
3. **ResultView**: 예상 최종 금액, 총 수익금, 연평균 수익률 표시 + 토스 포인트 지급 버튼

---

## 6. 기술 스택

| 항목 | 선택 |
|------|------|
| UI 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 5 |
| 상태 관리 | React useState (전역 상태 관리 라이브러리 없음) |
| 스타일링 | CSS-in-JS 없이 순수 CSS / inline style |
| 외부 의존성 | 없음 (백엔드 연동 없음) |


