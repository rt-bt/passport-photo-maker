'use client';

import { AlertOctagon, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Error</h2>
        <p className="text-slate-600 max-w-md mb-6 text-sm">
          A critical system error occurred. Please click below to refresh the application.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-medium shadow-sm hover:bg-orange-700 transition"
        >
          <RotateCcw className="w-4 h-4" /> Reload Studio
        </button>
      </body>
    </html>
  );
}
