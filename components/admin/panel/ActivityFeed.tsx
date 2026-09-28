export interface ActivityItem {
  id: number | string;
  initials: string;
  text: string;
  time: string;
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm panel-muted">No recent activity.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map(item => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ui-surface-2)] text-xs font-semibold text-[var(--ui-text-muted)]">
            {item.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 panel-heading">{item.text}</p>
            <p className="mt-0.5 text-xs panel-muted">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
