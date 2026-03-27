import { useState, useEffect, useCallback, useRef } from 'react';
import { AssetScreen } from './screens/AssetScreen';
import { FormScreen } from './screens/FormScreen';
import { AdScreen } from './screens/AdScreen';
import { ResultScreen } from './screens/ResultScreen';
import { BannerAd } from './components/BannerAd';
import { type Asset } from './data/assets';
import { calculateSimulation, type InvestmentType, type SimulationResult } from './hooks/useSimulation';
import { TossAds, graniteEvent } from '@apps-in-toss/web-framework';

type Screen = 'asset' | 'form' | 'ad' | 'result';

export function App() {
  const [screen, setScreen] = useState<Screen>('asset');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [investType, setInvestType] = useState<InvestmentType>('lump-sum');
  const [startYM, setStartYM] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [tossAdsReady, setTossAdsReady] = useState(false);
  const screenRef = useRef<Screen>('asset');

  const navigateTo = useCallback((next: Screen) => {
    screenRef.current = next;
    setScreen(next);
  }, []);

  // graniteEvent backEvent — asset 화면이 아닐 때만 등록하여 이전 화면으로 이동
  // asset 화면에서는 리스너를 해제하여 네이티브 기본 동작(앱 종료)이 실행돼요.
  useEffect(() => {
    if (screen === 'asset') return; // 최초 화면: 리스너 없음 → 네이티브 백 = 앱 종료

    const unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        const current = screenRef.current;
        if (current === 'result') {
          navigateTo('form');
        } else if (current === 'form') {
          navigateTo('asset');
        }
        // ad 화면은 자동 전환이므로 백버튼 무시
      },
      onError: (err) => console.warn('backEvent error:', err),
    });

    return unsubscribe;
  }, [screen, navigateTo]);

  // 배너 광고 SDK 초기화 — 앱 최상위에서 한 번만 호출
  // isSupported()는 토스 네이티브 브릿지가 없으면 throw하므로 try-catch로 감싸요.
  useEffect(() => {
    try {
      if (!TossAds.initialize.isSupported()) return;
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setTossAdsReady(true),
          onInitializationFailed: (e) => console.warn('TossAds 초기화 실패:', e),
        },
      });
    } catch {
      // 토스 앱 외부 환경(로컬 브라우저)에서는 광고 SDK를 사용할 수 없어요.
    }
  }, []);

  function handleAssetSelect(asset: Asset) {
    setSelectedAsset(asset);
    navigateTo('form');
  }

  function handleFormSubmit(params: {
    type: InvestmentType;
    startYearMonth: string;
    amount: number;
  }) {
    if (!selectedAsset) return;

    const r = calculateSimulation({
      asset: selectedAsset,
      type: params.type,
      startYearMonth: params.startYearMonth,
      amount: params.amount,
    });

    if (r) {
      setInvestType(params.type);
      setStartYM(params.startYearMonth);
      setResult(r);
      navigateTo('ad'); // 전면 광고 표시 후 결과로 이동
    }
  }

  function handleAdComplete() {
    navigateTo('result');
  }

  function handleReset() {
    // 완전 초기화 — React State만 사용, 외부 저장소 없음
    setSelectedAsset(null);
    setResult(null);
    setStartYM('');
    navigateTo('asset');
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        {screen === 'asset' && (
          <AssetScreen onSelect={handleAssetSelect} />
        )}

        {screen === 'form' && selectedAsset && (
          <FormScreen
            asset={selectedAsset}
            onSubmit={handleFormSubmit}
          />
        )}

        {screen === 'ad' && selectedAsset && (
          <AdScreen asset={selectedAsset} onAdComplete={handleAdComplete} />
        )}

        {screen === 'result' && selectedAsset && result && (
          <ResultScreen
            asset={selectedAsset}
            type={investType}
            startYearMonth={startYM}
            result={result}
            onReset={handleReset}
          />
        )}
      </div>

      {/* 배너 광고: 주요 콘텐츠 화면(자산 선택·결과)에만 표시 — 광고 로드 등 일시적 화면에는 미표시 */}
      {(screen === 'asset' || screen === 'result') && <BannerAd ready={tossAdsReady} />}
    </div>
  );
}
