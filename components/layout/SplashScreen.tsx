'use client';

import { useEffect, useState } from 'react';
import NovaLogo from '@/components/brand/NovaLogo';

/** How long the launch splash stays up before the app is revealed. */
const DISPLAY_MS = 3000;
const FADE_MS = 520;

export default function SplashScreen() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // The pre-paint script opts us in; if it never ran (or this session already
    // saw the splash) the overlay stays hidden and we do nothing.
    if (!root.hasAttribute('data-nova-splash')) return;

    let finished = false;
    let fadeTimer = 0;

    const dismiss = () => {
      if (finished) return;
      finished = true;
      setLeaving(true);
      fadeTimer = window.setTimeout(() => root.removeAttribute('data-nova-splash'), FADE_MS);
    };

    const displayTimer = window.setTimeout(dismiss, DISPLAY_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        window.clearTimeout(displayTimer);
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(displayTimer);
      window.clearTimeout(fadeTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      className={`nova-splash${leaving ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Nova Suites"
    >
      <div className="nova-splash-inner">
        <span className="nova-splash-eyebrow">Lagos · Nigeria</span>
        <NovaLogo variant="light" size="lg" />
        <span className="nova-splash-track" aria-hidden="true">
          <span className="nova-splash-bar" />
        </span>
        <span className="nova-splash-foot">Preparing your stay</span>
      </div>
    </div>
  );
}
