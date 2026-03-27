/**
 * 전면 광고 화면
 * loadFullScreenAd(interstitial) → loaded → showFullScreenAd → dismissed → onAdComplete
 * 실제 Toss 앱에서는 showFullScreenAd 호출 시 SDK가 화면을 가득 채우므로
 * 이 오버레이는 광고 로드 대기 중에만 보여요.
 */
import { useEffect, useState } from 'react';
import { type Asset } from '../data/assets';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { AD_IDS } from '../utils/adIds';

interface AdScreenProps {
  asset: Asset;
  onAdComplete: () => void;
}

export function AdScreen({ asset, onAdComplete }: AdScreenProps) {
  const [dots, setDots] = useState('');

  // 점 애니메이션 (시각적 피드백)
  useEffect(() => {
    const interval = setInterval(
      () => setDots((d) => (d.length >= 3 ? '' : d + '.')),
      400,
    );
    return () => clearInterval(interval);
  }, []);

  // 광고 로드 → 표시 → 완료
  useEffect(() => {
    let showUnregister: (() => void) | undefined;
    let done = false;
    const complete = () => {
      if (!done) {
        done = true;
        onAdComplete();
      }
    };

    // 미지원 환경 fallback (브라우저 포함 — isSupported()가 throw할 수 있어요)
    let supported = false;
    try { supported = loadFullScreenAd.isSupported(); } catch { /* no-op */ }
    if (!supported) {
      const t = setTimeout(complete, 1800);
      return () => clearTimeout(t);
    }

    // 5초 안전 타임아웃 (광고 서버 무응답 대비)
    const safetyTimer = setTimeout(complete, 5000);

    const loadUnregister = loadFullScreenAd({
      options: { adGroupId: AD_IDS.interstitial },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          showUnregister = showFullScreenAd({
            options: { adGroupId: AD_IDS.interstitial },
            onEvent: (e) => {
              if (e.type === 'dismissed' || e.type === 'failedToShow') {
                complete();
              }
            },
            onError: complete,
          });
        }
      },
      onError: complete,
    });

    return () => {
      clearTimeout(safetyTimer);
      loadUnregister();
      showUnregister?.();
    };
  }, [onAdComplete]);

  return (
    <>
      <style>{`
        @keyframes ad-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      <div style={s.overlay}>
        <div style={s.card}>
          <div style={s.loadingSection}>
            <div style={{ ...s.assetIcon, background: asset.color + '20' }}>
              <span style={{ fontSize: 32 }}>{asset.emoji}</span>
            </div>
            <div style={s.progressBar}>
              <div style={s.progressShimmer} />
            </div>
            <p style={s.loadingText}>
              {`${asset.name} 수익 계산 중${dots}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0 20px',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadingSection: {
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  assetIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    background: '#E5E8EB',
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '40%',
    background: 'linear-gradient(90deg, transparent, #3182F6, transparent)',
    borderRadius: 100,
    animation: 'ad-shimmer 1.4s ease-in-out infinite',
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7684',
    textAlign: 'center',
    margin: 0,
    fontWeight: 500,
  },
};
