'use client';

type Point = { x: number; y: number; label?: string };

export function Sparkline({
  points,
  height = 60,
  color = '#10b981',
}: {
  points: Point[];
  height?: number;
  color?: string;
}) {
  if (points.length < 2) {
    return (
      <div className="text-xs text-[var(--color-muted)] py-2">
        Not enough data yet.
      </div>
    );
  }
  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const width = 320;
  const stepX = width / (points.length - 1);

  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.y - minY) / range) * (height - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
      {points.map((p, i) => {
        const x = i * stepX;
        const y = height - ((p.y - minY) / range) * (height - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}
