import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
}

export default function KpiCard({ label, value, unit, icon: Icon, trend }: KpiCardProps) {
  return (
    <div className="panel-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium panel-muted">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ui-surface-2)] text-[var(--ui-text-muted)]">
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums panel-heading">{value}</span>
        {unit && <span className="text-sm panel-muted">{unit}</span>}
      </div>
      {trend && (
        <p className={`mt-2 text-xs font-medium ${trend.positive === false ? 'text-[var(--ui-danger)]' : 'text-[var(--ui-accent)]'}`}>
          {trend.value}
        </p>
      )}
    </div>
  );
}
