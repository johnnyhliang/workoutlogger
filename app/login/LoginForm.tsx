'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { loginAction } from './actions';

const EASTER_EGG_LINES = [
  "you're not johnny",
  "get out",
  "wrong house",
  "leave.",
  "shoo",
];

function WanderingGhost() {
  const [pos, setPos] = useState({ x: 10, y: 85 });
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({
        x: 5 + Math.random() * 88,
        y: 80 + Math.random() * 15,
      });
      if (Math.random() < 0.3) setLineIdx((i) => (i + 1) % EASTER_EGG_LINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="fixed text-[9px] text-neutral-800 select-none pointer-events-none transition-all duration-[3000ms] ease-in-out"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {EASTER_EGG_LINES[lineIdx]}
    </p>
  );
}

const WRONG_MESSAGES = [
  'Nope.',
  'lol no',
  'Sir, this is a Wendy\'s.',
  'skill issue',
  'Are you lost? The internet is two exits back.',
  'Wrong. Embarrassingly wrong.',
  'My brother in Christ, that is not the password.',
  'I\'m calling the police.',
  'You are not Johnny.',
  'Getting warmer... just kidding. Ice cold.',
  '404: Correct password not found.',
  'Have you considered giving up?',
  'The password is not "password". Nice try.',
  'Deploying disappointment...',
  'Wrong again bestie 💀',
  'At this point this is just sad.',
  'You will not pass. Not today. Not ever.',
  'Access denied. Specifically to you.',
  'Maybe try turning it off and on again.',
  'I\'ve seen better guesses from a golden retriever.',
  'Respectfully, what are you doing.',
  'Bold strategy. Not working, but bold.',
  'The call is coming from inside the house... and the password isn\'t this.',
  'Your confidence is inspiring. Your guesses are not.',
];

const BUTTON_LABELS = [
  'Enter',
  'Try Again',
  'Still Wrong?',
  'Bruh...',
  'Fine.',
  'Go ahead. Try.',
  'I dare you.',
  'Last chance (not really)',
  'You got this (you don\'t)',
  '🙃',
];

export function LoginForm({ next }: { next: string }) {
  const [state, action, isPending] = useActionState(loginAction, null);
  const [attempts, setAttempts] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [showChecking, setShowChecking] = useState(false);

  // Hover-block mechanic: kicks in after 10 wrong attempts
  const [hoverEnterCount, setHoverEnterCount] = useState(0);
  const [unblocked, setUnblocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBlockMode = attempts >= 10;
  const showBlockedOverlay = isBlockMode && !unblocked;

  // Detect server action returning error
  const prevState = useRef(state);
  useEffect(() => {
    if (state?.error && state !== prevState.current) {
      prevState.current = state;
      const next = attempts + 1;
      setAttempts(next);
      setMsgIndex((i) => (i + 1) % WRONG_MESSAGES.length);
      setUnblocked(false); // re-block after each failed attempt
      // Trigger shake
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  }, [state, attempts]);

  function handleHoverEnter() {
    if (!isBlockMode || unblocked) return;
    const next = hoverEnterCount + 1;
    setHoverEnterCount(next);
    if (next % 5 === 0) {
      setUnblocked(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const buttonLabel = BUTTON_LABELS[Math.min(attempts, BUTTON_LABELS.length - 1)];
  const errorMsg = attempts > 0 ? WRONG_MESSAGES[msgIndex] : null;

  return (
    <>
    <WanderingGhost />
    <form
      action={action}
      className={`w-full flex flex-col gap-4 ${shaking ? 'animate-shake' : ''}`}
    >
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.55s ease-in-out; }
      `}</style>

      <input type="hidden" name="next" value={next} />

      <div className="relative" onMouseEnter={handleHoverEnter}>
        <input
          ref={inputRef}
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          disabled={showBlockedOverlay || isPending}
          style={{ pointerEvents: showBlockedOverlay ? 'none' : undefined }}
          className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-lg outline-none focus:border-emerald-500 disabled:opacity-40"
        />
        {showBlockedOverlay && (
          <div className="absolute inset-0 rounded-lg bg-neutral-900 border border-red-900 flex items-center justify-center text-sm text-red-400 cursor-not-allowed select-none">
            🔒
          </div>
        )}
        {isBlockMode && unblocked && (
          <p className="absolute -top-5 left-0 text-[10px] text-emerald-500">fine, one more chance</p>
        )}
      </div>

      {errorMsg && (
        <p className="text-red-400 text-sm min-h-[1.25rem]">
          {errorMsg}
          {attempts >= 5 && (
            <span className="text-neutral-600 text-xs ml-2">
              (attempt {attempts})
            </span>
          )}
        </p>
      )}

      {attempts >= 5 && !isBlockMode && (
        <p className="text-[10px] text-neutral-700 -mt-2">
          attempts remaining: ∞
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || showBlockedOverlay}
        className="rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-semibold py-3 text-lg disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Checking...' : buttonLabel}
      </button>
    </form>
    </>
  );
}
