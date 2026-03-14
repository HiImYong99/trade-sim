# 핵심 정체성 (최우선 참조)

> **이 프로젝트는 "비게임 카테고리로 등록되는 무상태(Stateless) 과거 투자 수익 시뮬레이터"입니다.**

## 앱 설명

"그때 샀더라면" — 비트코인, 테슬라, 삼성전자 등 8개 자산에 과거 특정 날짜에 투자했다면
지금 얼마가 됐을지 계산해주는 일회성 시뮬레이터. 거치식/적립식 모두 지원.

---

## 개발 규칙 (Agent가 반드시 지켜야 할 사항)

### 절대 금지
- `localStorage`, `sessionStorage`, `IndexedDB`, 쿠키 등 영구 저장소 사용
- 백엔드 서버 / REST API / GraphQL 엔드포인트 추가 (시뮬레이션 = 클라이언트 계산)
- 게임 전용 API: `grantPromotionRewardForGame`, `getUserKeyForGame` 등
- 게임적 UI 텍스트: 퀘스트, 레벨, 인벤토리, 경험치 등

### 허용된 상태 관리
- `useState` — 세션 내 일시적 상태만 (앱 종료 시 초기화)

### 토스 API 사용 범위
| API | 파일 | 실제 패키지 |
|-----|------|------------|
| `share()` | `tossFrameworkMock.ts` | `@apps-in-toss/web-framework` |
| `loadFullScreenAd()` | `tossFrameworkMock.ts` | `@apps-in-toss/web-framework` |
| `showFullScreenAd()` | `tossFrameworkMock.ts` | `@apps-in-toss/web-framework` |
| 비게임 프로모션 | `tossFrameworkMock.ts` | Backend API (Mock) |

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 5 |
| UI 디자인 시스템 | **@toss/tds-mobile** (TDSMobileAITProvider로 감싸기) |
| 상태 관리 | React useState (전용 라이브러리 없음) |
| 외부 API | 없음 |

---

## 화면 흐름

```
AssetScreen (자산 선택)
  → FormScreen (날짜·금액·방식 입력)
  → AdScreen (전면 광고 1.8초)
  → ResultScreen (결과 + 차트 + 공유 + 포인트)
  → (다시 계산 → AssetScreen)
```

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/data/assets.ts` | 8개 자산 역사적 가격 데이터 + 보간 유틸 |
| `src/hooks/useSimulation.ts` | 거치식/적립식 수익 계산 로직 |
| `src/utils/tossFrameworkMock.ts` | share / loadFullScreenAd / showFullScreenAd / grantPromotionReward Mock |
| `src/screens/AssetScreen.tsx` | 자산 선택 그리드 화면 |
| `src/screens/FormScreen.tsx` | 투자 조건 입력 폼 (TDS Button 사용) |
| `src/screens/AdScreen.tsx` | 전면 광고 Mock UI |
| `src/screens/ResultScreen.tsx` | 결과·차트·공유·포인트 화면 |
| `src/components/PriceChart.tsx` | SVG 라인 차트 |
| `docs/architecture.md` | 아키텍처 설계 문서 |

---

## 개발 서버

```bash
npm install
npm run dev   # http://localhost:5173
npm run build # 프로덕션 빌드
```
