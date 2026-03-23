# AGENT.md — AI 에이전트 온보딩 가이드

## 프로젝트 정체성 (최상단 확인 필수)

**비게임 카테고리로 등록되는 무상태(Stateless) 투자 시뮬레이터**
- AppsInToss 일반 미니앱 (WebView 기반)
- 서버 없음 · DB 없음 · 영구 저장소 없음

---

## 새 에이전트 세션 시작 시 체크리스트

1. `CLAUDE.md` 읽기 — 절대 금지/허용 규칙 숙지
2. `docs/architecture.md` 읽기 — 전체 구조 파악
3. `src/App.tsx` 읽기 — 화면 흐름(input → ad → result) 확인

---

## 현재 구현 상태

### 완료된 기능
- [x] 거치식/적립식 투자 조건 입력 폼
- [x] 복리 수익 계산 로직 (거치식: FV = PV×(1+r)^n, 적립식: 월 복리 연금 공식)
- [x] 전면 광고 Mock UI (AdOverlay)
- [x] 시뮬레이션 결과 화면
- [x] 보상형 광고 → 토스 포인트 지급 플로우 (Mock)
- [x] 면책 문구 (예상 수익 ≠ 실제 자산)

### 미완료 / 향후 작업
- [ ] 실제 `@apps-in-toss/web-framework` SDK 연동 (tossPromoMock.ts → 실제 API 교체)
- [ ] 실제 `@toss/tds-mobile` TDS 컴포넌트 적용
- [ ] 수익률 차트 시각화
- [ ] 다크모드 지원

---

## 코드 수정 시 주의 사항

### 금지 패턴
```typescript
// ❌ 절대 금지
localStorage.setItem(...)
sessionStorage.setItem(...)
document.cookie = ...
fetch('https://api.example.com/...')  // 외부 백엔드
```

### 허용 패턴
```typescript
// ✅ 허용
const [value, setValue] = useState(...)  // React State만
```

### Mock → 실제 API 교체 방법
`src/utils/tossPromoMock.ts`의 각 함수를 `@apps-in-toss/web-framework`의 동일한 인터페이스 함수로 교체합니다.
함수 시그니처와 반환 타입은 동일하게 유지되어 있습니다.

---

## 연관 문서

| 문서 | 위치 |
|------|------|
| 아키텍처 설계 | `docs/architecture.md` |
| 개발 규칙 | `CLAUDE.md` |
| 스킬 목록 | `SKILL.md` |
