# SKILL.md — 프론트엔드 개발 도구 및 스킬 목록

## 프로젝트 환경

| 항목 | 버전 |
|------|------|
| Node.js | >= 18 |
| npm | >= 9 |
| React | 18.x |
| TypeScript | 5.x |
| Vite | 5.x |

---

## 주요 npm 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:5173) |
| `npm run build` | 프로덕션 빌드 (dist/) |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |

---

## 코드 패턴 레퍼런스

### 시뮬레이션 계산 (거치식/적립식)
```typescript
import { calculateSimulation } from './hooks/useSimulation';

const result = calculateSimulation({
  type: 'lump-sum',   // 또는 'recurring'
  principal: 10_000_000,
  annualRate: 7.0,
  years: 10,
});
// result.finalAmount, result.totalProfit, result.effectiveAnnualReturn
```

### 토스 프로모션 API 사용
```typescript
import { getUserInfo, showRewardedAd, grantPoint } from './utils/tossPromoMock';

const user = await getUserInfo();
const ad = await showRewardedAd();
if (ad.watched) {
  const result = await grantPoint({ userId: user.userId, amount: 100, reason: '...' });
}
```

---

## 향후 도입 권장 도구

| 도구 | 용도 | 도입 조건 |
|------|------|-----------|
| `@toss/tds-mobile` | TDS Web 컴포넌트 | 실제 토스 미니앱 제출 시 필수 |
| `@apps-in-toss/web-framework` | 토스 브리지 SDK | 실제 배포 환경 |
| Vitest | 단위 테스트 | 계산 로직 검증 |

---

## TDS 적용 가이드 (향후)

이 프로젝트는 `@apps-in-toss/web-framework` 기반 WebView 미니앱이므로:
- TDS 패키지: `@toss/tds-mobile`
- 참고 문서: `tossmini-docs.toss.im/tds-mobile`

현재는 TDS 없이 인라인 스타일로 구현되어 있으며, 제출 전 TDS 컴포넌트로 교체가 필요합니다.
