/**
 * 과거 투자 시뮬레이션용 자산 및 역사적 가격 데이터
 * - 모든 가격은 원본 통화 기준 (crypto/US stocks: USD, 삼성전자: KRW)
 * - ROI 계산은 비율 기반이라 통화 단위 무관
 * - 데이터 출처: 공개 시장 역사 가격 (시뮬레이션용 근사값)
 */

export type AssetType = 'crypto' | 'stock' | 'etf' | 'commodity';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetType;
  currency: 'USD' | 'KRW';
  emoji: string;
  icon: string;
  color: string;
  description: string;
  /** YYYY-MM → price (USD or KRW) */
  prices: Record<string, number>;
}

// 선형 보간으로 두 데이터 포인트 사이 월별 가격 계산
function interpolate(points: [string, number][]): Record<string, number> {
  const result: Record<string, number> = {};
  const sorted = [...points].sort(([a], [b]) => a.localeCompare(b));

  for (let i = 0; i < sorted.length - 1; i++) {
    const [startDate, startPrice] = sorted[i];
    const [endDate, endPrice] = sorted[i + 1];

    const [startY, startM] = startDate.split('-').map(Number);
    const [endY, endM] = endDate.split('-').map(Number);

    const startMonths = startY * 12 + startM;
    const endMonths = endY * 12 + endM;
    const totalMonths = endMonths - startMonths;

    for (let m = 0; m <= totalMonths; m++) {
      const totalM = startMonths + m;
      const y = Math.floor((totalM - 1) / 12);
      const mo = ((totalM - 1) % 12) + 1;
      const key = `${y}-${String(mo).padStart(2, '0')}`;
      const ratio = m / totalMonths;
      result[key] = Math.round((startPrice + (endPrice - startPrice) * ratio) * 100) / 100;
    }
  }
  return result;
}

export const ASSETS: Asset[] = [
  {
    id: 'btc', currency: 'USD' as const,
    name: '비트코인',
    ticker: 'BTC',
    type: 'crypto',
    emoji: '₿',
    icon: '/icons/btc.png',
    color: '#F7931A',
    description: '디지털 금',
    prices: interpolate([
      ['2015-01', 200],   ['2015-10', 240],
      ['2016-01', 430],   ['2016-07', 680],
      ['2017-01', 1000],  ['2017-06', 2500], ['2017-12', 14000],
      ['2018-06', 6700],  ['2018-12', 3200],
      ['2019-06', 9000],  ['2019-12', 7200],
      ['2020-03', 5200],  ['2020-12', 28900],
      ['2021-04', 59000], ['2021-11', 68000],
      ['2022-06', 20000], ['2022-12', 16500],
      ['2023-06', 30500], ['2023-12', 42000],
      ['2024-03', 71000], ['2024-06', 62000],
      ['2024-09', 60000], ['2024-11', 92000],
      ['2024-12', 97000], ['2025-01', 105000],
      ['2025-03', 84000], ['2025-06', 107000],
      ['2025-09', 110000], ['2025-12', 88000],
      ['2026-03', 69000],
    ]),
  },
  {
    id: 'eth', currency: 'USD' as const,
    name: '이더리움',
    ticker: 'ETH',
    type: 'crypto',
    emoji: '◈',
    icon: '/icons/eth.png',
    color: '#627EEA',
    description: '스마트 컨트랙트 플랫폼',
    prices: interpolate([
      ['2016-01', 10],   ['2016-07', 12],
      ['2017-01', 10],   ['2017-06', 320],  ['2017-12', 750],
      ['2018-06', 490],  ['2018-12', 82],
      ['2019-06', 290],  ['2019-12', 130],
      ['2020-03', 130],  ['2020-12', 735],
      ['2021-04', 2300], ['2021-11', 4800],
      ['2022-06', 1050], ['2022-12', 1200],
      ['2023-06', 1900], ['2023-12', 2300],
      ['2024-03', 3800], ['2024-06', 3500],
      ['2024-09', 2400], ['2024-12', 3400],
      ['2025-03', 2000], ['2025-06', 2500],
      ['2025-08', 4900], ['2025-12', 3000],
      ['2026-03', 2080],
    ]),
  },
  {
    id: 'nvda', currency: 'USD' as const,
    name: '엔비디아',
    ticker: 'NVDA',
    type: 'stock',
    emoji: '🟢',
    icon: '/icons/nvda.png',
    color: '#76B900',
    description: 'AI 반도체 선두주자',
    prices: interpolate([
      // 분할 조정 가격 (2021 4:1 + 2024 10:1 = ÷40 for pre-2021, ÷10 for 2021-2024)
      ['2015-01', 0.45], ['2016-01', 0.63],
      ['2017-01', 2.65], ['2018-01', 6],
      ['2019-01', 3.43], ['2020-01', 6],
      ['2021-01', 13.25],
      ['2022-01', 27],   ['2022-10', 12],
      ['2023-01', 15],   ['2023-06', 42],
      ['2023-12', 49.5], ['2024-03', 88],
      ['2024-06', 120],  ['2024-09', 116],
      ['2024-12', 135],  ['2025-03', 110],
      ['2025-06', 140],  ['2025-10', 207],
      ['2025-12', 180],  ['2026-03', 175],
    ]),
  },
  {
    id: 'tsla', currency: 'USD' as const,
    name: '테슬라',
    ticker: 'TSLA',
    type: 'stock',
    emoji: '⚡',
    icon: '/icons/tsla.png',
    color: '#E31937',
    description: '전기차 혁신 기업',
    prices: interpolate([
      ['2015-01', 45],  ['2016-01', 50],
      ['2017-01', 52],  ['2018-01', 63],
      ['2019-01', 60],  ['2020-01', 90],
      ['2020-08', 450], ['2020-12', 700],
      ['2021-11', 1200],
      ['2022-12', 125],
      ['2023-06', 260], ['2023-12', 250],
      ['2024-03', 170], ['2024-09', 250],
      ['2024-12', 400], ['2025-03', 280],
      ['2025-06', 310], ['2025-09', 380],
      ['2025-12', 490], ['2026-03', 370],
    ]),
  },
  {
    id: 'aapl', currency: 'USD' as const,
    name: '애플',
    ticker: 'AAPL',
    type: 'stock',
    emoji: '🍎',
    icon: '/icons/aapl.png',
    color: '#555555',
    description: '세계 최대 시가총액 기업',
    prices: interpolate([
      ['2015-01', 115], ['2016-01', 100],
      ['2017-01', 125], ['2018-01', 175],
      ['2019-01', 150], ['2020-01', 315],
      ['2020-04', 240], ['2021-01', 130],
      ['2022-01', 175], ['2022-12', 130],
      ['2023-06', 185], ['2023-12', 190],
      ['2024-03', 170], ['2024-06', 210],
      ['2024-09', 225], ['2024-12', 250],
      ['2025-03', 220], ['2025-06', 200],
      ['2025-09', 250], ['2025-12', 285],
      ['2026-03', 248],
    ]),
  },
  {
    id: 'samsung', currency: 'KRW' as const,
    name: '삼성전자',
    ticker: '005930',
    type: 'stock',
    emoji: '📱',
    icon: '/icons/samsung.png',
    color: '#1428A0',
    description: '국내 대표 반도체·가전 기업',
    prices: interpolate([
      ['2015-01', 25000], ['2016-01', 24000],
      ['2017-01', 48000], ['2018-01', 55000],
      ['2019-01', 40000], ['2020-01', 58000],
      ['2020-04', 48000], ['2021-01', 80000],
      ['2022-01', 76000], ['2022-12', 60000],
      ['2023-06', 72000], ['2023-12', 73000],
      ['2024-03', 74000], ['2024-06', 80000],
      ['2024-09', 60000], ['2024-12', 55000],
      ['2025-03', 57000], ['2025-06', 54000],
      ['2025-09', 100000], ['2025-12', 125000],
      ['2026-02', 223000], ['2026-03', 200000],
    ]),
  },
  {
    id: 'spy', currency: 'USD' as const,
    name: 'S&P 500',
    ticker: 'SPY',
    type: 'etf',
    emoji: '🇺🇸',
    icon: '/icons/spy.svg',
    color: '#3182F6',
    description: '미국 대표 500개 기업 지수',
    prices: interpolate([
      ['2015-01', 200], ['2016-01', 190],
      ['2017-01', 225], ['2018-01', 280],
      ['2019-01', 245], ['2020-01', 325],
      ['2020-04', 270], ['2021-01', 380],
      ['2022-01', 455], ['2022-12', 375],
      ['2023-01', 380], ['2023-12', 475],
      ['2024-03', 510], ['2024-06', 545],
      ['2024-09', 570], ['2024-12', 590],
      ['2025-03', 560], ['2025-06', 610],
      ['2025-09', 580], ['2025-12', 610],
      ['2026-03', 649],
    ]),
  },
  {
    id: 'gold', currency: 'USD' as const,
    name: '금',
    ticker: 'GOLD',
    type: 'commodity',
    emoji: '🥇',
    icon: '/icons/gold.svg',
    color: '#D4AF37',
    description: '대표적인 안전 자산',
    prices: interpolate([
      ['2015-01', 1200], ['2016-01', 1100],
      ['2017-01', 1150], ['2018-01', 1300],
      ['2019-01', 1280], ['2020-01', 1570],
      ['2020-08', 2000], ['2021-01', 1850],
      ['2022-03', 2050], ['2022-12', 1800],
      ['2023-06', 1930], ['2023-12', 2050],
      ['2024-03', 2200], ['2024-06', 2330],
      ['2024-09', 2630], ['2024-12', 2650],
      ['2025-03', 2900], ['2025-06', 3300],
      ['2025-09', 3870], ['2025-12', 4530],
      ['2026-03', 4490],
    ]),
  },
];

export function getAssetById(id: string): Asset | undefined {
  return ASSETS.find((a) => a.id === id);
}

/** 주어진 날짜에 가장 가까운 가격 반환 */
export function getPriceAt(asset: Asset, yearMonth: string): number | null {
  if (asset.prices[yearMonth] != null) return asset.prices[yearMonth];

  // 가장 가까운 날짜 찾기
  const keys = Object.keys(asset.prices).sort();
  const idx = keys.findIndex((k) => k >= yearMonth);
  if (idx === -1) return asset.prices[keys[keys.length - 1]] ?? null;
  if (idx === 0) return asset.prices[keys[0]] ?? null;
  return asset.prices[keys[idx]] ?? null;
}

/** 해당 자산의 현재 가격 (데이터셋 내 최신) */
export function getCurrentPrice(asset: Asset): number {
  const keys = Object.keys(asset.prices).sort();
  return asset.prices[keys[keys.length - 1]];
}

/** 해당 자산의 데이터 시작 월 */
export function getEarliestDate(asset: Asset): string {
  return Object.keys(asset.prices).sort()[0];
}
