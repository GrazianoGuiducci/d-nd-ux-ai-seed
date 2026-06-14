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

let cssInjected = false;
const LIVE_BADGE_CSS = `
.lbd {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
}
.lbd-dot {
  width: 0.375rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgb(100 116 139);
}
.lbd-dot-live {
  background: rgb(103 232 249);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.55);
  animation: lbdPulse 1.8s ease-in-out infinite;
}
.lbd-dot-stale {
  background: rgb(252 211 77);
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.35);
}
.lbd-dot-error {
  background: rgb(253 164 175);
  box-shadow: 0 0 6px rgba(251, 113, 133, 0.35);
}
.lbd-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.35;
  color: rgb(var(--text-muted, 170 175 190));
}
@media (prefers-reduced-motion: reduce) {
  .lbd-dot-live { animation: none; }
}
@keyframes lbdPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.42; }
}
`;

function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  if (document.getElementById('live-badge-css')) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = 'live-badge-css';
  style.textContent = LIVE_BADGE_CSS;
  document.head.appendChild(style);
  cssInjected = true;
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
  useEffect(() => { injectCSS(); }, []);

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
        if (mounted) setStatus('error');
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

  return (
    <span className={`lbd ${className}`} data-status={status}>
      <span className={`lbd-dot lbd-dot-${status} ${dotClassName}`} />
      <span className="lbd-text">
        {render(data, status)}
      </span>
    </span>
  );
}

