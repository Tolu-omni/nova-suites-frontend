interface SplitBarProps {
  primary: { label: string; value: number };
  secondary: { label: string; value: number };
}

export default function SplitBar({ primary, secondary }: SplitBarProps) {
  const total = primary.value + secondary.value;
  const primaryPct = total ? (primary.value / total) * 100 : 0;
  const secondaryPct = total ? 100 - primaryPct : 0;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--ui-surface-2)]">
        <span style={{ width: `${primaryPct}%`, background: 'var(--ui-accent)' }} />
        <span style={{ width: `${secondaryPct}%`, background: 'var(--ui-danger)' }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 panel-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--ui-accent)' }} aria-hidden="true" />
          {primary.label}
          <strong className="font-semibold panel-heading">{primary.value}</strong>
        </span>
        <span className="flex items-center gap-2 panel-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--ui-danger)' }} aria-hidden="true" />
          {secondary.label}
          <strong className="font-semibold panel-heading">{secondary.value}</strong>
        </span>
      </div>
    </div>
  );
}
