/**
 * @apps-in-toss/web-framework API 모킹
 *
 * 실제 배포 시 import를 '@apps-in-toss/web-framework'로 교체하세요.
 *
 * 실제 API 참조:
 * - share: share({ message }) — 네이티브 공유 시트
 * - loadFullScreenAd / showFullScreenAd — 통합 광고 2.0 ver2
 * - TossAds — 배너 광고 SDK (initialize / attachBanner / destroyAll)
 * - 비게임 프로모션: POST /api-partner/v1/apps-in-toss/promotion/execute-promotion
 */

// ─── 앱 종료 ────────────────────────────────────────────────────────────────

/**
 * 미니앱 종료 (토스 앱으로 복귀)
 * 실제: import { closeView } from '@apps-in-toss/web-framework'
 */
export function closeView(): void {
  // Mock: 로컬 환경에서는 이전 페이지로 이동
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.close();
  }
}

// ─── 공유하기 ───────────────────────────────────────────────────────────────

/**
 * 네이티브 공유 시트 표시
 * 실제: import { share } from '@apps-in-toss/web-framework'
 */
export async function share(options: { message: string }): Promise<void> {
  // Mock: Web Share API 또는 클립보드 복사로 대체
  if (navigator.share) {
    await navigator.share({ text: options.message });
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(options.message);
    throw new Error('CLIPBOARD_COPIED'); // 복사 완료 신호
  }
}

// ─── graniteEvent (뒤로가기·홈 이벤트) ─────────────────────────────────────

/**
 * 네이티브 이벤트 리스너
 * 실제: import { graniteEvent } from '@apps-in-toss/web-framework'
 * backEvent 등록 시 기본 뒤로가기(앱 종료)가 차단되고 onEvent가 호출돼요.
 */
type GraniteEventType = 'backEvent' | 'homeEvent';
interface GraniteEventListener {
  onEvent: () => void;
  onError?: (error: unknown) => void;
}

const _backEventListeners: Set<GraniteEventListener> = new Set();

export const graniteEvent = {
  addEventListener(type: GraniteEventType, listener: GraniteEventListener): () => void {
    if (type === 'backEvent') {
      _backEventListeners.add(listener);

      // Mock: 브라우저 popstate로 backEvent 시뮬레이션
      const handler = (e: PopStateEvent) => {
        if (_backEventListeners.has(listener)) {
          e.preventDefault();
          // 히스토리를 다시 push해서 뒤로가기 소비를 방지
          history.pushState(null, '');
          try {
            listener.onEvent();
          } catch (err) {
            listener.onError?.(err);
          }
        }
      };
      window.addEventListener('popstate', handler);

      return () => {
        _backEventListeners.delete(listener);
        window.removeEventListener('popstate', handler);
      };
    }
    return () => {};
  },
};

// ─── 통합 광고 2.0 ver2 ────────────────────────────────────────────────────

type LoadFullScreenAdEvent = { type: 'loaded' };
type ShowFullScreenAdEvent =
  | { type: 'requested' }
  | { type: 'show' }
  | { type: 'impression' }
  | { type: 'clicked' }
  | { type: 'dismissed' }
  | { type: 'failedToShow' }
  | { type: 'userEarnedReward'; data: { unitType: string; unitAmount: number } };

interface LoadFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: LoadFullScreenAdEvent) => void;
  onError: (err: unknown) => void;
}

interface ShowFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (event: ShowFullScreenAdEvent) => void;
  onError: (err: unknown) => void;
}

/**
 * 광고 미리 로드
 * 실제: import { loadFullScreenAd } from '@apps-in-toss/web-framework'
 */
export function loadFullScreenAd(params: LoadFullScreenAdParams): () => void {
  const timer = setTimeout(() => {
    params.onEvent({ type: 'loaded' });
  }, 800); // Mock: 0.8초 후 로드 완료

  return () => clearTimeout(timer);
}
loadFullScreenAd.isSupported = () => true;

/**
 * 로드된 광고 표시
 * 실제: import { showFullScreenAd } from '@apps-in-toss/web-framework'
 * 리워드 광고: userEarnedReward 이벤트 발생 시에만 포인트 지급
 */
export function showFullScreenAd(params: ShowFullScreenAdParams): () => void {
  // Mock 이벤트 시퀀스: requested → show → impression → userEarnedReward → dismissed
  const timers: ReturnType<typeof setTimeout>[] = [];

  timers.push(setTimeout(() => params.onEvent({ type: 'requested' }), 100));
  timers.push(setTimeout(() => params.onEvent({ type: 'show' }), 300));
  timers.push(setTimeout(() => params.onEvent({ type: 'impression' }), 500));
  timers.push(setTimeout(() => {
    // 보상형 광고: 시청 완료 시 리워드 지급
    params.onEvent({
      type: 'userEarnedReward',
      data: { unitType: 'point', unitAmount: 5 },
    });
  }, 2000));
  timers.push(setTimeout(() => params.onEvent({ type: 'dismissed' }), 2200));

  return () => timers.forEach(clearTimeout);
}
showFullScreenAd.isSupported = () => true;

// ─── TossAds (배너 광고) ────────────────────────────────────────────────────

export type TossAdsAttachBannerOptions = {
  theme?: 'auto' | 'light' | 'dark';
  tone?: 'blackAndWhite' | 'grey';
  variant?: 'card' | 'expanded';
  callbacks?: {
    onAdRendered?: (p: { slotId: string; adGroupId: string }) => void;
    onAdViewable?: (p: { slotId: string; adGroupId: string }) => void;
    onAdImpression?: (p: { slotId: string; adGroupId: string }) => void;
    onAdClicked?: (p: { slotId: string; adGroupId: string }) => void;
    onAdFailedToRender?: (p: { slotId: string; adGroupId: string; error: { code: number; message: string } }) => void;
    onNoFill?: (p: { slotId: string; adGroupId: string }) => void;
  };
};

let _tossAdsInitialized = false;

/**
 * 배너 광고 SDK
 * 실제: import { TossAds } from '@apps-in-toss/web-framework'
 * 문서: 인앱 광고 2.0 ver2 (배너 광고 - WebView)
 *   - initialize: 앱 최상위에서 한 번만 호출
 *   - attachBanner: DOM 요소에 배너 부착 (width 100%, height 96px 권장)
 *   - 배너는 광고 렌더링 후 10초 경과 또는 visibility 복귀 시 자동 갱신
 */
export const TossAds = {
  initialize: Object.assign(
    (options?: {
      callbacks?: {
        onInitialized?: () => void;
        onInitializationFailed?: (e: Error) => void;
      };
    }) => {
      if (_tossAdsInitialized) {
        options?.callbacks?.onInitialized?.();
        return;
      }
      setTimeout(() => {
        _tossAdsInitialized = true;
        options?.callbacks?.onInitialized?.();
      }, 300);
    },
    { isSupported: (): boolean => true },
  ),

  attachBanner: Object.assign(
    (
      adGroupId: string,
      target: string | HTMLElement,
      options?: TossAdsAttachBannerOptions,
    ): { destroy: () => void } => {
      const el =
        typeof target === 'string'
          ? document.querySelector<HTMLElement>(target)
          : target;
      if (!el) return { destroy: () => {} };

      const slotId = `mock-banner-${Math.random().toString(36).slice(2, 8)}`;
      const payload = { slotId, adGroupId };

      // Mock 배너 HTML 삽입 (실제 환경에서는 TossAds SDK가 광고 콘텐츠를 주입)
      el.innerHTML = `
        <div style="width:100%;height:96px;background:#F2F4F6;display:flex;align-items:center;justify-content:space-between;padding:0 16px;box-sizing:border-box;border-top:1px solid #E5E8EB;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:56px;height:56px;background:linear-gradient(135deg,#3182F6,#54A0FF);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">💰</div>
            <div>
              <div style="font-size:13px;font-weight:700;color:#191F28;margin-bottom:2px;">스마트한 금융 생활</div>
              <div style="font-size:11px;color:#6B7684;">지금 바로 시작해 보세요</div>
            </div>
          </div>
          <span style="font-size:10px;color:#B0B8C1;background:#E5E8EB;padding:3px 7px;border-radius:4px;flex-shrink:0;">광고</span>
        </div>`;

      const initTimer = setTimeout(() => {
        options?.callbacks?.onAdRendered?.(payload);
        options?.callbacks?.onAdViewable?.(payload);
        options?.callbacks?.onAdImpression?.(payload);
      }, 400);

      // Mock 자동 갱신: 실제 SDK는 10초 경과 or visibility 복귀 시 갱신
      const refreshInterval = setInterval(() => {
        options?.callbacks?.onAdRendered?.(payload);
        options?.callbacks?.onAdImpression?.(payload);
      }, 15_000);

      return {
        destroy: () => {
          clearTimeout(initTimer);
          clearInterval(refreshInterval);
          el.innerHTML = '';
        },
      };
    },
    { isSupported: (): boolean => true },
  ),

  destroyAll: Object.assign(
    () => { /* mock: no-op */ },
    { isSupported: (): boolean => true },
  ),
};

