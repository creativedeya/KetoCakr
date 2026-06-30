'use client';

import { useState } from 'react';

interface WaitlistFormProps {
  variant?: 'hero' | 'journal';
}

export default function WaitlistForm({ variant = 'hero' }: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="form-ok">
        <h3>You&apos;re in the Lab. ✓</h3>
        <p>Check your inbox for the Keto Baking Cheat Sheet.</p>
      </div>
    );
  }

  if (variant === 'journal') {
    return (
      <form className="journal-form" onSubmit={handleSubmit}>
        <label htmlFor="journal-email">Your email</label>
        <input
          id="journal-email"
          name="email"
          type="email"
          placeholder="alchemist@lab.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Access the Cheat Sheet'}
        </button>
        <div className="journal-note">* We value your privacy as much as our sourdough starters. No spam.</div>
      </form>
    );
  }

  return (
    <div id="waitlist">
      <form className="hero-form" onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="your@email.com" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Get Early Access'}
        </button>
      </form>
      <p className="hero-note">Free forever tier available. Early members get founding discount.</p>
    </div>
  );
}
