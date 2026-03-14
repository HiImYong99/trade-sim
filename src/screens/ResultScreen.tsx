import { useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { type Asset } from '../data/assets';
import { type SimulationResult, type InvestmentType, DATA_END_LABEL } from '../hooks/useSimulation';
import { PriceChart } from '../components/PriceChart';
import { share, getTossShareLink } from '@apps-in-toss/web-framework';

interface ResultScreenProps {
  asset: Asset;
  type: InvestmentType;
  startYearMonth: string;
  result: SimulationResult;
  onReset: () => void;
}

export function ResultScreen({ asset, type, startYearMonth, result, onReset }: ResultScreenProps) {
  const [shareMsg, setShareMsg] = useState('');

  const isProfit = result.totalProfit >= 0;
  const [sy, sm] = startYearMonth.split('-');
  const typeLabel = type === 'lump-sum' ? '거치식' : '적립식';
  const profitSign = isProfit ? '+' : '';

  async function handleShare() {
    const profitText = isProfit
      ? `+${formatKRW(result.totalProfit)} (${result.profitRate > 0 ? '+' : ''}${result.profitRate.toFixed(1)}%)`
      : `${formatKRW(result.totalProfit)} (${result.profitRate.toFixed(1)}%)`;

    // getTossShareLink: intoss://if-bought → 클릭 시 토스 앱으로 바로 이동
    // 토스 앱 미설치 시 앱스토어/플레이스토어로 이동
    // 브라우저 환경에서는 지원하지 않으므로 try-catch로 fallback
    let shareLink = '';
    try {
      shareLink = await getTossShareLink('intoss://if-bought');
    } catch {
      // 브라우저/샌드박스 환경에서는 링크 없이 텍스트만 공유
    }

    const msg =
      `${sy}년 ${sm}월에 ${asset.name}에 ${formatKRW(result.totalInvested)} ${typeLabel} 투자했다면?\n` +
      `지금 ${formatKRW(result.currentValue)} → ${profitText}\n` +
      `\n나도 계산해보기 👇\n` +
      (shareLink || '"그때 샀더라면" 앱에서 과거 투자 수익을 계산해 보세요!');

    try {
      await share({ message: msg });
      setShareMsg('공유 완료!');
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'CLIPBOARD_COPIED') {
        setShareMsg('링크가 복사되었어요');
      } else {
        setShareMsg('공유를 지원하지 않는 환경이에요');
      }
    }
    setTimeout(() => setShareMsg(''), 2500);
  }

  return (
    <div style={s.container}>
      {/* 상단 내비게이션 */}
      <div style={s.topBar}>
        <button
          onClick={onReset}
          style={s.backBtn}
          aria-label="처음으로 돌아가기"
        >
          ← 다시 계산
        </button>
        <div style={s.assetTag} aria-label={`자산: ${asset.name}`}>
          <span aria-hidden="true">{asset.emoji}</span>
          <span>{asset.name}</span>
        </div>
      </div>

      <main style={s.scroll}>
        {/* 면책 문구 */}
        <p style={s.disclaimer} role="note">
          ※ 과거 데이터 기반 시뮬레이션이며, 투자 자문이 아닙니다.<br />
          실제 투자 결과와 다를 수 있으며, 미래 수익을 보장하지 않습니다.
        </p>

        {/* 메인 결과 카드 */}
        <section
          style={{
            ...s.mainCard,
            background: isProfit
              ? 'linear-gradient(135deg, #1A7E3E, #24A152)'
              : 'linear-gradient(135deg, #C62828, #E53935)',
          }}
          aria-label={`투자 결과: ${isProfit ? '수익' : '손실'} ${profitSign}${result.profitRate.toFixed(1)}%`}
        >
          <div style={s.mainCardHeader}>
            <span style={s.mainCardLabel}>
              {sy}년 {sm}월 {typeLabel} 투자 시뮬레이션 결과
            </span>
            <span style={s.profitBadge} aria-hidden="true">
              {isProfit ? '📈' : '📉'} {profitSign}{result.profitRate.toFixed(1)}%
            </span>
          </div>

          <div style={s.amountRow}>
            <div>
              <p style={s.amountLabel}>투자 원금</p>
              <p style={s.amount}>{formatKRW(result.totalInvested)}</p>
            </div>
            <div style={s.arrow} aria-hidden="true">→</div>
            <div>
              <p style={s.amountLabel}>{DATA_END_LABEL} 가치</p>
              <p style={{ ...s.amount, fontSize: 26 }}>{formatKRW(result.currentValue)}</p>
            </div>
          </div>

          <div style={s.profitRow}>
            <span style={s.profitLabel}>예상 수익금</span>
            <span style={s.profitAmount}>
              {profitSign}{formatKRW(result.totalProfit)}
            </span>
          </div>
        </section>

        {/* 가치 추이 차트 */}
        <section style={s.chartCard}>
          <p style={s.chartTitle}>투자 가치 추이</p>
          <p style={s.chartSubtitle} id="chart-desc">
            {sy}년 {sm}월 → {DATA_END_LABEL} · {result.monthsInvested}개월
          </p>
          <PriceChart
            points={result.monthlyPoints}
            color={asset.color}
            totalInvested={result.totalInvested}
            descId="chart-desc"
          />
          <p style={s.chartLegend} aria-hidden="true">
            <span style={{ color: '#8B95A1' }}>- - -</span> 투자 원금선
          </p>
        </section>

        {/* 세부 수치 */}
        <section style={s.detailCard} aria-label="투자 상세 내역">
          <DetailRow label="투자 방식" value={typeLabel} />
          <DetailRow label="시작 시점" value={`${sy}년 ${sm}월`} />
          <DetailRow
            label={type === 'lump-sum' ? '투자 원금' : '월 납입금'}
            value={type === 'lump-sum'
              ? `${result.totalInvested.toLocaleString()}원`
              : `${(result.totalInvested / result.monthsInvested).toLocaleString()}원/월`}
          />
          <div style={s.divider} role="separator" />
          <DetailRow
            label="총 투자 원금"
            value={`${result.totalInvested.toLocaleString()}원`}
          />
          <DetailRow
            label={`${DATA_END_LABEL} 가치`}
            value={`${result.currentValue.toLocaleString()}원`}
            highlight
          />
          <DetailRow
            label="예상 수익금"
            value={`${profitSign}${result.totalProfit.toLocaleString()}원`}
            color={isProfit ? '#1A7E3E' : '#C62828'}
          />
          <DetailRow
            label="수익률"
            value={`${profitSign}${result.profitRate.toFixed(1)}%`}
            color={isProfit ? '#1A7E3E' : '#C62828'}
          />
          <div style={s.divider} role="separator" />
          <DetailRow label="매수 시점 가격" value={formatAssetPrice(result.buyPrice, asset.currency)} />
          <DetailRow label={`${DATA_END_LABEL} 가격`} value={formatAssetPrice(result.currentPrice, asset.currency)} />
        </section>

        {/* 공유하기 버튼 */}
        <div style={s.shareSection}>
          <Button
            color="dark"
            variant="weak"
            display="full"
            size="large"
            onClick={handleShare}
          >
            📤 결과 공유하기
          </Button>
          {/* aria-live 영역으로 공유 완료 피드백 */}
          <div aria-live="polite" aria-atomic="true">
            {shareMsg && <p style={s.shareMsg}>{shareMsg}</p>}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontSize: 13, color: '#6B7684' }}>{label}</span>
      <span style={{
        fontSize: highlight ? 15 : 13,
        fontWeight: highlight ? 700 : 500,
        color: color ?? '#191F28',
      }}>
        {value}
      </span>
    </div>
  );
}

function formatAssetPrice(price: number, currency: 'USD' | 'KRW'): string {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  return `${price.toLocaleString()}원`;
}

function formatKRW(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.floor((abs % 100_000_000) / 10_000);
    return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString()}만` : ''}원`;
  }
  if (abs >= 10_000) return `${sign}${Math.floor(abs / 10_000).toLocaleString()}만원`;
  return `${sign}${abs.toLocaleString()}원`;
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#F2F4F6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px 8px 8px',
    background: '#fff',
    borderBottom: '1px solid #F2F4F6',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 14,
    color: '#3182F6',
    cursor: 'pointer',
    padding: '8px 12px',
    fontWeight: 600,
    minHeight: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
    WebkitTapHighlightColor: 'transparent',
  },
  assetTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 700,
    color: '#191F28',
    background: '#F2F4F6',
    padding: '5px 12px',
    borderRadius: 100,
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8B95A1',
    margin: '12px 0',
    textAlign: 'center',
  },
  mainCard: {
    borderRadius: 20,
    padding: '20px',
    marginBottom: 12,
    color: '#fff',
  },
  mainCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  profitBadge: {
    fontSize: 13,
    fontWeight: 800,
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 10px',
    borderRadius: 100,
  },
  amountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    opacity: 0.85,
    margin: '0 0 4px',
  },
  amount: {
    fontSize: 20,
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  arrow: {
    fontSize: 20,
    opacity: 0.7,
    flexShrink: 0,
  },
  profitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: '10px 14px',
  },
  profitLabel: { fontSize: 12, opacity: 0.9 },
  profitAmount: { fontSize: 16, fontWeight: 800 },
  chartCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#191F28',
    margin: '0 0 2px',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#8B95A1',
    margin: '0 0 12px',
  },
  chartLegend: {
    fontSize: 12,
    color: '#8B95A1',
    margin: '8px 0 0',
    textAlign: 'center',
  },
  detailCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  divider: { height: 1, background: '#F2F4F6', margin: '4px 0' },
  shareSection: {
    marginBottom: 12,
  },
  shareMsg: {
    fontSize: 13,
    color: '#3182F6',
    textAlign: 'center',
    margin: '8px 0 0',
    fontWeight: 600,
  },
};
