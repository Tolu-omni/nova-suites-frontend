import { AlertCircle, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  const isNetwork = message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
  const Icon = isNetwork ? WifiOff : AlertCircle;

  return (
    <div className={`flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-900 ${className}`} role="alert">
      <Icon size={16} className="mt-0.5 flex-shrink-0 text-red-700" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description = '',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md border border-[var(--nova-border-light)] bg-[var(--nova-ivory-soft)]">
        <AlertCircle size={28} className="text-[var(--nova-taupe)]" aria-hidden="true" />
      </div>
      <h3 className="nova-card-heading mb-2 text-[var(--nova-text-dark)]">{title}</h3>
      {description && <p className="nova-body mb-6 max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
