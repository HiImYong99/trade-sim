import { ASSETS, type Asset } from '../data/assets';

interface AssetScreenProps {
  onSelect: (asset: Asset) => void;
}

export function AssetScreen({ onSelect }: AssetScreenProps) {
  return (
    <div style={s.container}>
      <header style={s.header}>
        <h1 style={s.title}>그때 샀더라면</h1>
        <p style={s.subtitle}>
          과거에 투자했다면 지금 얼마일까요?<br />
          궁금한 자산을 선택하세요
        </p>
      </header>

      <div style={s.grid} role="list" aria-label="자산 목록">
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            style={s.card}
            onClick={() => onSelect(asset)}
            aria-label={`${asset.name} (${asset.ticker}) 선택`}
            role="listitem"
          >
            <div style={{ ...s.iconBox, background: asset.color + '18' }}>
              <img
                src={asset.icon}
                alt={asset.name}
                style={s.iconImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.querySelector('span')!.style.display = 'block';
                }}
              />
              <span style={{ ...s.emoji, display: 'none' }} aria-hidden="true">{asset.emoji}</span>
            </div>
            <p style={s.assetName}>{asset.name}</p>
            <p style={s.assetTicker}>{asset.ticker}</p>
          </button>
        ))}
      </div>

      <p style={s.disclaimer} role="note">
        ※ 과거 데이터 기반의 순수 시뮬레이션으로, 투자 자문이 아니에요.<br />
        실제 투자 결과와 다를 수 있으며, 투자 손실에 대한 책임은 지지 않아요.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '24px 20px 32px',
    background: '#F9FAFB',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#191F28',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7684',
    margin: 0,
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    border: '2px solid transparent',
    borderRadius: 16,
    padding: '20px 16px',
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'left',
    transition: 'transform 0.1s, box-shadow 0.1s',
    WebkitTapHighlightColor: 'transparent',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 28,
    height: 28,
    objectFit: 'contain',
    borderRadius: 4,
  },
  emoji: {
    fontSize: 22,
  },
  assetName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#191F28',
    margin: 0,
  },
  assetTicker: {
    fontSize: 12,
    color: '#6B7684',
    margin: 0,
    fontWeight: 500,
  },
  disclaimer: {
    fontSize: 12,
    color: '#8B95A1',
    textAlign: 'center',
    lineHeight: 1.7,
    margin: 0,
  },
};
