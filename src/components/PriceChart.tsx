/**
 * SVG 라인 차트 — 투자 기간 가치 추이
 */
import type { MonthlyPoint } from '../hooks/useSimulation';

interface PriceChartProps {
  points: MonthlyPoint[];
  color: string;
  totalInvested: number;
  descId?: string;
}

export function PriceChart({ points, color, totalInvested, descId }: PriceChartProps) {
  if (points.length < 2) return null;

  const W = 335;
  const H = 140;
  const PAD = { top: 12, right: 8, bottom: 24, left: 8 };

  const values = points.map((p) => p.value);
  const investedValues = points.map((p) => p.invested);
  const minV = Math.min(...values, ...investedValues, totalInvested * 0.5);
  const maxV = Math.max(...values, ...investedValues);
  const range = maxV - minV || 1;

  const toX = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
  const toY = (v: number) =>
    PAD.top + ((maxV - v) / range) * (H - PAD.top - PAD.bottom);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(' ');

  const areaD =
    pathD +
    ` L ${toX(points.length - 1).toFixed(1)} ${H - PAD.bottom} L ${toX(0).toFixed(1)} ${H - PAD.bottom} Z`;

  // 원금선: 적립식이면 월별 누적 투자액으로 사선, 거치식이면 수평선
  const principalPathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.invested).toFixed(1)}`)
    .join(' ');
  const principalY = toY(totalInvested);

  const lastX = toX(points.length - 1);
  const lastY = toY(points[points.length - 1].value);
  const currentValue = points[points.length - 1].value;
  const profit = currentValue - totalInvested;
  const isProfit = profit >= 0;

  const chartLabel =
    `투자 가치 추이 차트. ` +
    `${formatDate(points[0].yearMonth)}부터 ${formatDate(points[points.length - 1].yearMonth)}까지. ` +
    `현재 가치 ${formatCompact(currentValue)}원, ` +
    `${isProfit ? '수익' : '손실'} ${isProfit ? '+' : ''}${formatCompact(profit)}원`;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', width: '100%' }}
        role="img"
        aria-label={chartLabel}
        aria-describedby={descId}
      >
        <title>투자 가치 추이</title>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* 원금선 (점선): 거치식=수평선, 적립식=누적 사선 */}
        {principalY > PAD.top && principalY < H - PAD.bottom && (
          <path
            d={principalPathD}
            fill="none"
            stroke="#B0B8C1"
            strokeWidth="1"
            strokeDasharray="4 3"
            aria-hidden="true"
          />
        )}

        {/* 면적 채우기 */}
        <path d={areaD} fill="url(#chartGrad)" aria-hidden="true" />

        {/* 라인 */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        />

        {/* 현재 값 점 */}
        <circle cx={lastX} cy={lastY} r="5" fill={color} aria-hidden="true" />
        <circle cx={lastX} cy={lastY} r="3" fill="#fff" aria-hidden="true" />

        {/* X축 날짜 */}
        <text x={toX(0)} y={H - 4} textAnchor="start" fontSize="10" fill="#8B95A1" aria-hidden="true">
          {formatDate(points[0].yearMonth)}
        </text>
        <text x={lastX} y={H - 4} textAnchor="end" fontSize="10" fill="#8B95A1" aria-hidden="true">
          {formatDate(points[points.length - 1].yearMonth)}
        </text>
      </svg>

      {/* 수익/손실 배지 */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '4px 10px',
          background: isProfit ? '#E8F8EE' : '#FFF0F0',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          color: isProfit ? '#1A7E3E' : '#C62828',
        }}
        aria-hidden="true"
      >
        {isProfit ? '+' : ''}{formatCompact(profit)}
      </div>
    </div>
  );
}

function formatCompact(v: number): string {
  if (Math.abs(v) >= 100_000_000)
    return `${(v / 100_000_000).toFixed(1)}억`;
  if (Math.abs(v) >= 10_000)
    return `${Math.round(v / 10_000).toLocaleString()}만`;
  return v.toLocaleString();
}

function formatDate(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y.slice(2)}년 ${m}월`;
}
