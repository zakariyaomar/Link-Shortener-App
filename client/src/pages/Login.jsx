// client/src/pages/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <main className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-10 flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">LS</span>
          Link Shortener App
        </Link>
        <div>
          <p className="text-sm font-semibold text-indigo-600">SIGN IN</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Enter your details to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New to Link Shortener App?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline">
            Create an account
          </Link>
        </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-12 text-white lg:flex lg:flex-col">
          <div className="absolute -right-20 top-12 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-12 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-indigo-700">LS</span>
            Link Shortener App
          </div>
          <div className="relative my-auto">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Welcome back</p>
            <h2 className="max-w-md text-4xl font-semibold leading-tight">Your links, organized and ready to share.</h2>
            <ul className="mt-8 space-y-4 text-sm text-indigo-100">
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 font-bold text-cyan-200">✓</span> Create memorable short links</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 font-bold text-cyan-200">✓</span> Manage every destination in one place</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 font-bold text-cyan-200">✓</span> Return to the links you need quickly</li>
            </ul>
          </div>
          <p className="relative text-sm text-indigo-200">Everything you need to share with confidence.</p>
        </section>
      </main>
    </div>
  );
}