import { useState, useId } from 'react';
import { Button } from '@toss/tds-mobile';
import { type Asset, getEarliestDate } from '../data/assets';
import { DATA_END, DATA_END_LABEL } from '../hooks/useSimulation';
import type { InvestmentType } from '../hooks/useSimulation';

interface FormScreenProps {
  asset: Asset;
  onSubmit: (params: {
    type: InvestmentType;
    startYearMonth: string;
    amount: number;
  }) => void;
}

const [DATA_END_YEAR, DATA_END_MONTH_NUM] = DATA_END.split('-').map(Number);
const CURRENT_YEAR = DATA_END_YEAR;
const CURRENT_MONTH = DATA_END_MONTH_NUM;

// ─── Custom Picker ──────────────────────────────────────────────────────────

interface PickerOption {
  label: string;
  value: number;
}

function CustomPicker({
  value,
  options,
  onChange,
  pickerLabel,
}: {
  value: number;
  options: PickerOption[];
  onChange: (v: number) => void;
  pickerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={ps.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${pickerLabel}: ${selected?.label ?? '선택'}`}
      >
        {selected?.label ?? '—'}
        <span style={ps.chevron} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div
          style={ps.overlay}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            style={ps.sheet}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${pickerLabel} 선택`}
          >
            <div style={ps.sheetHandle} aria-hidden="true" />
            <div
              id={listId}
              style={ps.list}
              role="listbox"
              aria-label={pickerLabel}
            >
              {options.map((o) => (
                <button
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  style={{
                    ...ps.item,
                    ...(o.value === value ? ps.itemActive : {}),
                  }}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                  {o.value === value && (
                    <span style={ps.check} aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ps: Record<string, React.CSSProperties> = {
  trigger: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px',
    height: 60,
    border: '1.5px solid #E5E8EB',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 700,
    color: '#191F28',
    background: '#fff',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  chevron: {
    fontSize: 14,
    color: '#8B95A1',
    marginLeft: 4,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
  },
  sheet: {
    width: '100%',
    background: '#fff',
    borderRadius: '20px 20px 0 0',
    maxHeight: '55vh',
    display: 'flex',
    flexDirection: 'column',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    background: '#E5E8EB',
    borderRadius: 2,
    margin: '12px auto 8px',
    flexShrink: 0,
  },
  list: {
    overflowY: 'auto',
    padding: '4px 0 24px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '14px 24px',
    minHeight: 52,
    border: 'none',
    background: 'transparent',
    fontSize: 18,
    fontWeight: 500,
    color: '#191F28',
    cursor: 'pointer',
    textAlign: 'left',
    WebkitTapHighlightColor: 'transparent',
  },
  itemActive: {
    fontWeight: 700,
    color: '#3182F6',
    background: '#F0F5FF',
  },
  check: {
    fontSize: 16,
    color: '#3182F6',
  },
};

// ─── Main Form ──────────────────────────────────────────────────────────────

export function FormScreen({ asset, onSubmit }: FormScreenProps) {
  const earliestDate = getEarliestDate(asset);
  const earliestYear = Number(earliestDate.slice(0, 4));
  const amountInputId = useId();
  const amountErrorId = useId();

  const [type, setType] = useState<InvestmentType>('lump-sum');
  const [year, setYear] = useState(2020);
  const [month, setMonth] = useState(1);
  const [amountDisplay, setAmountDisplay] = useState('1,000,000');
  const [amountError, setAmountError] = useState('');

  const years: PickerOption[] = Array.from(
    { length: CURRENT_YEAR - earliestYear + 1 },
    (_, i) => {
      const y = earliestYear + i;
      return { label: `${y}년`, value: y };
    },
  );

  const maxMonth = year === CURRENT_YEAR ? CURRENT_MONTH - 1 : 12;
  const months: PickerOption[] = Array.from({ length: maxMonth }, (_, i) => ({
    label: `${i + 1}월`,
    value: i + 1,
  }));

  function handleYearChange(y: number) {
    setYear(y);
    if (y === CURRENT_YEAR && month >= CURRENT_MONTH) setMonth(1);
  }

  function handleAmountChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    const num = Number(digits);
    setAmountDisplay(digits ? num.toLocaleString() : '');
    if (!digits || num < 10000) setAmountError('최소 1만원 이상 입력하세요');
    else if (num > 1_000_000_000) setAmountError('최대 10억원까지 입력 가능해요');
    else setAmountError('');
  }

  const startYearMonth = `${year}-${String(month).padStart(2, '0')}`;
  const amount = Number(amountDisplay.replace(/,/g, ''));
  const isValid = amount >= 10000 && amount <= 1_000_000_000 && !amountError;

  return (
    <div style={s.container}>
      {/* 헤더 */}
      <div style={s.header}>
        <div style={s.assetBadge} aria-label={`선택된 자산: ${asset.name}`}>
          <span aria-hidden="true">{asset.emoji}</span>
          <span style={s.assetBadgeName}>{asset.name}</span>
        </div>
      </div>

      <h2 style={s.title}>언제, 얼마나<br />투자했을까요?</h2>

      {/* 투자 방식 */}
      <div style={s.section}>
        <p style={s.sectionLabel} id="invest-type-label">투자 방식</p>
        <div style={s.toggleRow} role="group" aria-labelledby="invest-type-label">
          <button
            style={{ ...s.toggleBtn, ...(type === 'lump-sum' ? s.toggleActive : {}) }}
            onClick={() => setType('lump-sum')}
            aria-pressed={type === 'lump-sum'}
          >
            <span style={s.toggleIcon} aria-hidden="true">💰</span>
            <span style={s.toggleText}>거치식</span>
            <span style={s.toggleDesc}>한 번에 전액</span>
          </button>
          <button
            style={{ ...s.toggleBtn, ...(type === 'recurring' ? s.toggleActive : {}) }}
            onClick={() => setType('recurring')}
            aria-pressed={type === 'recurring'}
          >
            <span style={s.toggleIcon} aria-hidden="true">📅</span>
            <span style={s.toggleText}>적립식</span>
            <span style={s.toggleDesc}>매월 정액</span>
          </button>
        </div>
      </div>

      {/* 시작 날짜 */}
      <div style={s.section}>
        <p style={s.sectionLabel} id="date-label">
          {type === 'lump-sum' ? '투자 시점' : '투자 시작 시점'}
        </p>
        <div style={s.dateRow} role="group" aria-labelledby="date-label">
          <CustomPicker
            value={year}
            options={years}
            onChange={handleYearChange}
            pickerLabel="연도"
          />
          <CustomPicker
            value={month}
            options={months}
            onChange={setMonth}
            pickerLabel="월"
          />
        </div>
        <p style={s.dateHint}>
          {DATA_END_LABEL} 기준으로 계산돼요
        </p>
      </div>

      {/* 투자 금액 */}
      <div style={s.section}>
        <label htmlFor={amountInputId} style={s.sectionLabel}>
          {type === 'lump-sum' ? '투자 원금' : '월 납입금'}
        </label>
        <div style={{ ...s.inputBox, ...(amountError ? s.inputBoxError : {}) }}>
          <input
            id={amountInputId}
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={(e) => handleAmountChange(e.target.value)}
            style={s.input}
            placeholder="1,000,000"
            aria-required="true"
            aria-invalid={!!amountError}
            aria-describedby={amountError ? amountErrorId : undefined}
          />
          <span style={s.unit} aria-hidden="true">원</span>
        </div>
        {amountError && (
          <p id={amountErrorId} role="alert" style={s.errorText}>
            {amountError}
          </p>
        )}

        {/* 빠른 선택 */}
        <div style={s.presets} role="group" aria-label="금액 빠른 선택">
          {[100_000, 500_000, 1_000_000, 5_000_000, 10_000_000].map((v) => (
            <button
              key={v}
              style={{ ...s.presetBtn, ...(amount === v ? s.presetBtnActive : {}) }}
              onClick={() => handleAmountChange(String(v))}
              aria-label={`${(v / 10000).toLocaleString()}만원으로 설정`}
              aria-pressed={amount === v}
            >
              {v >= 10000 ? `${(v / 10000).toLocaleString()}만` : `${v.toLocaleString()}`}
            </button>
          ))}
        </div>
      </div>

      {/* 투자 기간 표시 */}
      {isValid && (
        <div style={s.previewCard} aria-live="polite" aria-atomic="true">
          <span style={s.previewEmoji} aria-hidden="true">{asset.emoji}</span>
          <div>
            <p style={s.previewTitle}>
              {year}년 {month}월 {type === 'lump-sum' ? '한 번에' : '부터 매월'}
            </p>
            <p style={s.previewAmount}>
              {amountDisplay}원{type === 'recurring' ? '/월' : ''} 투자했다면?
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={s.cta}>
        <Button
          color="primary"
          variant="fill"
          display="full"
          size="xlarge"
          disabled={!isValid}
          onClick={() => {
            if (!isValid) return;
            onSubmit({ type, startYearMonth, amount });
          }}
        >
          결과 확인하기
        </Button>
        <p style={s.adNotice}>
          📢 결과 확인 전 짧은 광고가 표시돼요
        </p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '0 0 0',
    background: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: 12,
    borderBottom: '1px solid #F2F4F6',
  },
  assetBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: '#F2F4F6',
    borderRadius: 100,
  },
  assetBadgeName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#191F28',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#191F28',
    margin: '24px 20px 28px',
    lineHeight: 1.4,
    letterSpacing: '-0.5px',
  },
  section: {
    padding: '0 20px 24px',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4E5968',
    margin: '0 0 10px',
    display: 'block',
    letterSpacing: '0.3px',
  },
  toggleRow: {
    display: 'flex',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 16px',
    minHeight: 88,
    background: '#F8F9FA',
    border: '2px solid #E5E8EB',
    borderRadius: 14,
    cursor: 'pointer',
    gap: 2,
    transition: 'all 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  toggleActive: {
    background: '#EEF5FF',
    border: '2px solid #3182F6',
  },
  toggleIcon: { fontSize: 20 },
  toggleText: {
    fontSize: 15,
    fontWeight: 700,
    color: '#191F28',
    marginTop: 4,
  },
  toggleDesc: {
    fontSize: 12,
    color: '#6B7684',
  },
  dateRow: {
    display: 'flex',
    gap: 10,
  },
  dateHint: {
    fontSize: 12,
    color: '#8B95A1',
    margin: '8px 0 0',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #E5E8EB',
    borderRadius: 10,
    padding: '12px 14px',
    background: '#fff',
  },
  inputBoxError: {
    border: '1.5px solid #F04452',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 18,
    fontWeight: 600,
    color: '#191F28',
    background: 'transparent',
    minWidth: 0,
    minHeight: 44,
  },
  unit: {
    fontSize: 15,
    color: '#6B7684',
    marginLeft: 8,
    flexShrink: 0,
  },
  errorText: {
    fontSize: 13,
    color: '#F04452',
    margin: '6px 0 0',
  },
  presets: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  presetBtn: {
    padding: '8px 16px',
    minHeight: 36,
    background: '#F2F4F6',
    border: '1.5px solid transparent',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    color: '#4E5968',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  presetBtnActive: {
    background: '#EEF5FF',
    border: '1.5px solid #3182F6',
    color: '#3182F6',
    fontWeight: 700,
  },
  previewCard: {
    margin: '0 20px 20px',
    padding: '16px',
    background: '#F8F9FA',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    border: '1px solid #F2F4F6',
  },
  previewEmoji: { fontSize: 28 },
  previewTitle: {
    fontSize: 13,
    color: '#6B7684',
    margin: '0 0 2px',
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: 700,
    color: '#191F28',
    margin: 0,
  },
  cta: {
    padding: '12px 20px 20px',
    borderTop: '1px solid #F2F4F6',
  },
  adNotice: {
    fontSize: 12,
    color: '#8B95A1',
    textAlign: 'center',
    margin: '8px 0 0',
  },
};
