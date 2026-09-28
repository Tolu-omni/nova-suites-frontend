import NovaLogo from '@/components/brand/NovaLogo';

export default function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} rounded-full border-2 border-[var(--nova-border-light)] border-t-[var(--nova-gold)] animate-spin`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--nova-ivory)]">
      <NovaLogo variant="dark" size="lg" showLocation className="mb-5" />
      <LoadingSpinner size="lg" />
    </div>
  );
}
