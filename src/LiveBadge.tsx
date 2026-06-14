import React, { useEffect, useState } from 'react';

export type LiveBadgeStatus = 'idle' | 'live' | 'stale' | 'error';

export interface LiveBadgeProps<T = unknown> {
  endpoint: string;
  render: (data: T, status: LiveBadgeStatus) => React.ReactNode;
  pollInterval?: number;
  staleAfter?: number;
  fallback?: React.ReactNode;
  className?: string;
  dotClassName?: string;
  requestInit?: RequestInit;
}

/**
 * LiveBadge — small live-data indicator for public read-only endpoints.
 *
 * Rule: data can change, layout cannot. Keep the badge width stable in the
 * consuming surface when values may vary.
 */
export default function LiveBadge<T = unknown>({
  endpoint,
  render,
  pollInterval = 60000,
  staleAfter = 120000,
  fallback = null,
  className = '',
  dotClassName = '',
  requestInit,
}: LiveBadgeProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LiveBadgeStatus>('idle');
  const [lastSeen, setLastSeen] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch(endpoint, requestInit);
        if (!res.ok) throw new Error(`LiveBadge ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setData(json as T);
        setLastSeen(Date.now());
        setStatus('live');
      } catch {
        if (mounted) setStatus(current => (data ? current : 'error'));
      }
    };

    fetchData();
    const interval = window.setInterval(fetchData, pollInterval);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [endpoint, pollInterval, requestInit]);

  useEffect(() => {
    if (!lastSeen || status === 'error') return;
    const interval = window.setInterval(() => {
      setStatus(Date.now() - lastSeen > staleAfter ? 'stale' : 'live');
    }, Math.min(30000, staleAfter));
    return () => window.clearInterval(interval);
  }, [lastSeen, staleAfter, status]);

  if (!data) return <>{fallback}</>;

  const dotColor =
    status === 'live'
      ? 'bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.55)]'
      : status === 'stale'
      ? 'bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.35)]'
      : 'bg-slate-500';

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor} ${status === 'live' ? 'animate-pulse' : ''} ${dotClassName}`} />
      <span className="min-w-0 font-mono text-sm text-slate-400">
        {render(data, status)}
      </span>
    </span>
  );
}

