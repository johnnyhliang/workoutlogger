'use client';
import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export function PushSubscribe() {
  const [status, setStatus] = useState<'unknown' | 'subscribed' | 'denied' | 'unsupported'>('unknown');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return;
    }
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'subscribed' : 'unknown');
      });
    });
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { setStatus('denied'); return; }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    setStatus('subscribed');
  }

  if (status === 'unsupported') return null;
  if (status === 'subscribed') return <p className="text-xs text-[var(--color-accent)]">Notifications enabled</p>;
  if (status === 'denied') return <p className="text-xs text-[var(--color-bad)]">Notifications blocked</p>;
  return (
    <button type="button" onClick={subscribe} className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 border border-[var(--color-border)] text-[var(--color-muted)]">
      Enable notifications
    </button>
  );
}
