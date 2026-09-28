export interface ChartPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  /** Accessible summary announced to screen readers. */
  caption: string;
  /** Stroke/fill colour. Defaults to the Nova gold brand colour. */
  color?: string;
}

/**
 * Lightweight SVG area chart — no charting dependency.
 * Scales to its container; x-axis labels are drawn in SVG so they stay aligned.
 */
export function AreaChart({ data, height = 220, formatValue = value => String(value), caption, color = 'var(--nova-gold)' }: AreaChartProps) {
  const width = 720;
  const padX = 6;
  const padTop = 18;
  const padBottom = 30;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(1, ...data.map(point => point.value));
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    ...point,
    x: padX + index * stepX,
    y: padTop + (1 - point.value / max) * plotHeight,
  }));

  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const baseline = padTop + plotHeight;
  const area = `${padX},${baseline} ${line} ${padX + (data.length - 1) * stepX},${baseline}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={caption}>
        <defs>
          <linearGradient id="nova-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map(ratio => {
          const y = padTop + ratio * plotHeight;
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="var(--nova-border-light)"
              strokeWidth="1"
              strokeDasharray={ratio === 1 ? undefined : '4 6'}
            />
          );
        })}

        <polygon points={area} fill="url(#nova-area-fill)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map(point => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="3.5" fill="var(--ui-surface)" stroke={color} strokeWidth="2" />
            <title>{`${point.label}: ${formatValue(point.value)}`}</title>
          </g>
        ))}

        {points.map(point => (
          <text
            key={`label-${point.label}`}
            x={point.x}
            y={height - 9}
            textAnchor="middle"
            fontSize="11"
            fill="var(--nova-text-muted)"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** Lightweight SVG line chart (with soft area fill) — no charting dependency. */
export function LineChart({ data, height = 220, formatValue = value => String(value), caption, color = 'var(--nova-gold)' }: AreaChartProps) {
  const width = 720;
  const padX = 6;
  const padTop = 18;
  const padBottom = 30;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(1, ...data.map(point => point.value));
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    ...point,
    x: padX + index * stepX,
    y: padTop + (1 - point.value / max) * plotHeight,
  }));

  const line = points.map(point => `${point.x},${point.y}`).join(' ');
  const baseline = padTop + plotHeight;
  const area = `${padX},${baseline} ${line} ${padX + (data.length - 1) * stepX},${baseline}`;
  const gradientId = `nova-line-${points.length}-${caption.length}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={caption}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map(ratio => {
          const y = padTop + ratio * plotHeight;
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="var(--ui-border)"
              strokeWidth="1"
              strokeDasharray={ratio === 1 ? undefined : '4 6'}
            />
          );
        })}

        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map(point => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="3.5" fill="var(--ui-surface)" stroke={color} strokeWidth="2" />
            <title>{`${point.label}: ${formatValue(point.value)}`}</title>
          </g>
        ))}

        {points.map(point => (
          <text key={`label-${point.label}`} x={point.x} y={height - 9} textAnchor="middle" fontSize="11" fill="var(--ui-text-muted)">
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  caption: string;
}

function buildArcs(segments: DonutSegment[], total: number, circumference: number) {
  const arcs: { segment: DonutSegment; dash: number; offset: number }[] = [];
  let running = 0;
  for (const segment of segments) {
    const fraction = total ? segment.value / total : 0;
    const dash = fraction * circumference;
    arcs.push({ segment, dash, offset: running });
    running += dash;
  }
  return arcs;
}

/** SVG donut with a legend. */
export function DonutChart({ segments, size = 170, thickness = 22, centerLabel, caption }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const arcs = buildArcs(segments, total, circumference);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={caption} className="shrink-0">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--nova-ivory)" strokeWidth={thickness} />
        {arcs.map(arc => (
          <circle
            key={arc.segment.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.segment.color}
            strokeWidth={thickness}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            transform={`rotate(-90 ${center} ${center})`}
          >
            <title>{`${arc.segment.label}: ${arc.segment.value}`}</title>
          </circle>
        ))}
        <text x={center} y={center - 2} textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--nova-text-dark)">
          {total}
        </text>
        {centerLabel && (
          <text x={center} y={center + 18} textAnchor="middle" fontSize="10" fill="var(--nova-text-muted)">
            {centerLabel}
          </text>
        )}
      </svg>

      <ul className="min-w-[140px] flex-1 space-y-2 text-sm">
        {segments.map(segment => (
          <li key={segment.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[var(--nova-text-muted)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segment.color }} aria-hidden="true" />
              {segment.label}
            </span>
            <span className="font-semibold text-[var(--nova-text-dark)]">
              {segment.value}
              <span className="ml-1.5 text-xs font-normal text-[var(--nova-text-muted)]">
                ({total ? Math.round((segment.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({data,formatValue=String,caption,color='var(--nova-gold)'}:AreaChartProps){
 const max=Math.max(1,...data.map(p=>p.value));
 return <figure aria-label={caption}><div className="space-y-3">{data.map((p,i)=><div key={`${p.label}-${i}`} className="grid grid-cols-[3rem_1fr] items-center gap-3 text-xs"><span>{p.label}</span><div><span className="block text-[var(--nova-text-muted)]">{formatValue(p.value)}</span><div className="mt-1 h-4 overflow-hidden rounded bg-[var(--nova-sand)]"><div className="h-full" style={{width:`${p.value/max*100}%`, background: color}}/></div></div></div>)}</div><figcaption className="mt-4 text-xs text-[var(--nova-text-muted)]">{caption}</figcaption><details className="mt-4 text-sm"><summary className="cursor-pointer">View data table</summary><table className="admin-table"><thead><tr><th>Period</th><th>Amount</th></tr></thead><tbody>{data.map((p,i)=><tr key={i}><td>{p.label}</td><td>{formatValue(p.value)}</td></tr>)}</tbody></table></details></figure>;
}
