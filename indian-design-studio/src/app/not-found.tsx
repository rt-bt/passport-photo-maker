import Link from 'next/link';
import { HelpCircle, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-600 max-w-md mb-6 text-sm">
        The design template or page you are looking for does not exist or may have been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-medium shadow-sm hover:bg-orange-700 transition"
        >
          <Home className="w-4 h-4" /> Go to Home
        </Link>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition"
        >
          <Sparkles className="w-4 h-4" /> Browse Templates
        </Link>
      </div>
    </div>
  );
}
