const RED = '#E8302A';
const BLUE = '#29ABE2';
const YELLOW = '#F5A623';
const DARK = '#1A1A1A';

const dotColors = [RED, BLUE, YELLOW, RED, BLUE];
const letters = ['C', 'H', 'O', 'S', 'E', 'N'];

export default function ChosenLogo({ size = 'small' }) {
  const letterSize = size === 'large' ? 28 : 24;
  const dotSize = size === 'large' ? 7 : 6;
  const labelSize = size === 'large' ? 14 : 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: labelSize, letterSpacing: 4, color: DARK, marginBottom: 2 }}>
        THE
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {letters.map((letter, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: letterSize, fontWeight: 700, color: DARK }}>{letter}</span>
            {i < letters.length - 1 && (
              <span
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: dotColors[i],
                  display: 'inline-block',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: labelSize - 1, letterSpacing: 3, color: DARK, marginTop: 2 }}>
        COLLECTIVE
      </span>
    </div>
  );
}