interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-700';
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: '',
    rounded: 'rounded-lg',
  };
  return <div className={`${base} ${variants[variant]} ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <Skeleton className="h-6 w-3/4 mb-2" variant="text" />
      <Skeleton className="h-4 w-1/2 mb-4" variant="text" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full rounded" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
