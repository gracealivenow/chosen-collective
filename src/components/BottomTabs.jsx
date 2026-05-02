const RED = '#E8302A';
const DARK = '#1a1a2e';
const INACTIVE = '#888';

const Icon = ({ name, color }) => {
  const props = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'book':
      return (
        <svg {...props}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'music':
      return (
        <svg {...props}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...props}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    default:
      return null;
  }
};

const TABS = [
  { name: 'Home', icon: 'home' },
  { name: 'Devo', icon: 'book' },
  { name: 'Prayer', icon: 'heart' },
  { name: 'Worship', icon: 'music' },
  { name: 'Chat', icon: 'chat' },
  { name: 'Connect', icon: 'mail' },
];

export default function BottomTabs({ activeTab, onChange }) {
  return (
    <nav style={s.bar}>
      {TABS.map((tab) => {
        const active = tab.name === activeTab;
        const color = active ? RED : INACTIVE;
        return (
          <button
            key={tab.name}
            onClick={() => onChange(tab.name)}
            style={s.tab}
            aria-label={tab.name}
          >
            <Icon name={tab.icon} color={color} />
            <span style={{ ...s.label, color }}>{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

const s = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    backgroundColor: DARK,
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    height: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 0,
    fontFamily: 'inherit',
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
};