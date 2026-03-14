/**
 * 배너 광고 컴포넌트
 * - 화면 일부에 표시되는 배너 광고 (height 96px)
 * - TossAds SDK가 자동으로 광고를 갱신해요 (렌더링 후 10초 경과 or visibility 복귀 시)
 * 실제: import { TossAds } from '@apps-in-toss/web-framework'
 */
import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { AD_IDS } from '../utils/adIds';

interface BannerAdProps {
  /** TossAds.initialize 완료 여부 */
  ready: boolean;
}

export function BannerAd({ ready }: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    try { if (!TossAds.attachBanner.isSupported()) return; } catch { return; }

    const attached = TossAds.attachBanner(AD_IDS.banner, containerRef.current, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: 'expanded',
      callbacks: {
        onAdFailedToRender: (p) =>
          console.warn('배너 광고 렌더링 실패:', p.error.message),
        onNoFill: () =>
          console.warn('표시할 배너 광고가 없습니다'),
      },
    });

    return () => attached?.destroy();
  }, [ready]);

  // ready 전: 96px 공간만 확보 (레이아웃 shift 방지)
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', minHeight: 96 }}
      role="complementary"
      aria-label="배너 광고"
    />
  );
}
