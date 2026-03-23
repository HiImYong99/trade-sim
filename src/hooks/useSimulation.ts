/**
 * 과거 투자 수익 시뮬레이션 계산 로직
 * - 거치식: 특정 날짜에 전액 투자 → 현재 가치
 * - 적립식: 매월 정액 투자 → 현재 가치 합산
 * 모든 계산은 메모리 내에서만 수행 (localStorage 없음)
 */

import { type Asset, getPriceAt, getCurrentPrice } from '../data/assets';

export type InvestmentType = 'lump-sum' | 'recurring';

export interface SimulationInput {
  asset: Asset;
  type: InvestmentType;
  startYearMonth: string; // 'YYYY-MM'
  amount: number;         // 원금 (거치식) 또는 월 납입금 (적립식), 단위: KRW
}

export interface MonthlyPoint {
  yearMonth: string;
  value: number;    // 해당 시점의 보유 자산 현재가치 (KRW)
  invested: number; // 해당 시점까지 누적 투자 원금 (KRW)
}

export interface SimulationResult {
  totalInvested: number;      // 총 투자 원금
  currentValue: number;       // 현재 가치
  totalProfit: number;        // 수익금
  profitRate: number;         // 수익률 (%)
  monthlyPoints: MonthlyPoint[]; // 월별 가치 추이 (차트용)
  buyPrice: number;           // 매수 시점 가격
  currentPrice: number;       // 현재 가격
  monthsInvested: number;     // 투자 기간(개월)
}

function addMonths(yearMonth: string, n: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const total = y * 12 + m - 1 + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

// 데이터셋 최신 기준: 2026-03 (2026년 3월 22일 기준)
export const DATA_END = '2026-03';
export const DATA_END_LABEL = '2026년 3월';
const CURRENT_MONTH = DATA_END;

export function calculateSimulation(input: SimulationInput): SimulationResult | null {
  const { asset, type, startYearMonth, amount } = input;

  const buyPrice = getPriceAt(asset, startYearMonth);
  if (!buyPrice) return null;

  const currentPrice = getCurrentPrice(asset);
  const totalMonths = monthsBetween(startYearMonth, CURRENT_MONTH);
  if (totalMonths < 0) return null;

  const monthlyPoints: MonthlyPoint[] = [];
  let totalInvested = 0;
  let totalUnits = 0; // 보유 단위(주/코인 수) — 비율 계산용

  if (type === 'lump-sum') {
    // 거치식: 시작 시점에 전액 매수
    totalInvested = amount;
    totalUnits = amount / buyPrice; // 단위당 원금/매수가 = 보유 단위

    for (let i = 0; i <= totalMonths; i++) {
      const ym = addMonths(startYearMonth, i);
      const priceAt = getPriceAt(asset, ym) ?? currentPrice;
      monthlyPoints.push({
        yearMonth: ym,
        value: Math.round(totalUnits * priceAt),
        invested: totalInvested,
      });
    }
  } else {
    // 적립식: 매월 정액 매수
    const holdings: { units: number; priceAt: number }[] = [];

    for (let i = 0; i <= totalMonths; i++) {
      const ym = addMonths(startYearMonth, i);
      const priceAt = getPriceAt(asset, ym) ?? currentPrice;

      // 이번 달 매수
      const units = amount / priceAt;
      holdings.push({ units, priceAt });
      totalInvested += amount;
      totalUnits += units;

      // 현재 기준 전체 보유분 가치 계산
      const valueNow = holdings.reduce((sum, h) => sum + h.units * priceAt, 0);
      monthlyPoints.push({ yearMonth: ym, value: Math.round(valueNow), invested: totalInvested });
    }
  }

  const currentValue = type === 'lump-sum'
    ? Math.round(totalUnits * currentPrice)
    : monthlyPoints[monthlyPoints.length - 1].value;

  const totalProfit = currentValue - totalInvested;
  const profitRate = (totalProfit / totalInvested) * 100;

  return {
    totalInvested,
    currentValue,
    totalProfit,
    profitRate: Math.round(profitRate * 10) / 10,
    monthlyPoints,
    buyPrice,
    currentPrice,
    monthsInvested: totalMonths,
  };
}
