'use client';

import { useState } from 'react';

export default function SettingsClient({ initialMaskPaid = false }) {
  const [maskPaid, setMaskPaid] = useState(initialMaskPaid);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null

  const handleToggle = async () => {
    const nextState = !maskPaid;
    setLoading(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maskPaidOrders: nextState }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update setting');
      }

      setMaskPaid(data.maskPaidOrders);
      setSaveStatus('saved');

      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage store and admin visibility preferences.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 pr-2">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Automatic Paid Order Masking
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              New orders placed will appear as Pending for regular Admins.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={maskPaid}
            disabled={loading}
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              maskPaid ? 'bg-amber-500' : 'bg-muted/40'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Toggle masking paid orders"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                maskPaid ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {saveStatus === 'saved' && (
          <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Settings saved successfully.
          </p>
        )}

        {saveStatus === 'error' && (
          <p className="mt-4 text-xs text-rose-600 dark:text-rose-400 font-medium">
            Failed to save setting. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
