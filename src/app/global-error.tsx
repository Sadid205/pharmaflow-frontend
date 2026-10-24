'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900">Fatal Application Error</h2>
          <p className="text-sm text-slate-500">
            {error.message || 'The application encountered an unrecoverable state.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
