const COLORS = ['#E8302A', '#29ABE2', '#F5A623', '#E8302A', '#29ABE2'];

export default function DotRow({ size = 6, opacity = 0.7 }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {COLORS.map((c, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c,
            opacity,
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}