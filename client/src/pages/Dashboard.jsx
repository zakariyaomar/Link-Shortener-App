// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLinks() {
      try {
        const response = await fetch(`${API_URL}/api/links`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && !cancelled) {
          setLinks(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch links:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLinks();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          customCode: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setLinks([data, ...links]);
      setUrl('');
      setCustomCode('');
      showToast('Link created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`${API_URL}/api/links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setLinks(links.filter(link => link.id !== id));
        showToast('Link deleted');
      }
    } catch {
      showToast('Failed to delete link', 'error');
    }
  };

  const handleCopy = async (shortUrl, id) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg transition-opacity ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Link Shortener App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hello, {user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Create link form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shorten a link</h2>
          <form onSubmit={handleCreateLink}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Custom code (optional)"
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Shorten'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </form>
        </div>

        {/* Links list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your links</h2>
            <p className="text-sm text-gray-500">{links.length} total links</p>
          </div>

          {loading ? (
            <div className="p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="mb-4 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-2">No links yet</p>
              <p className="text-sm text-gray-400">
                Paste a URL above to create your first short link.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {links.map((link) => (
                <div key={link.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Short URL */}
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-medium hover:underline truncate"
                        >
                          {link.shortUrl}
                        </a>
                        <button
                          onClick={() => handleCopy(link.shortUrl, link.id)}
                          className={`shrink-0 px-2 py-1 text-xs rounded transition-colors ${
                            copiedId === link.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {copiedId === link.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Original URL */}
                      <p className="text-sm text-gray-500 truncate">
                        {link.originalUrl}
                      </p>
                    </div>

                    {/* Stats and actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{link.clicks}</p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-sm text-gray-600">{formatDate(link.createdAt)}</p>
                        <p className="text-xs text-gray-400">created</p>
                      </div>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Last clicked */}
                  {link.lastClicked && (
                    <p className="text-xs text-gray-400 mt-2">
                      Last clicked: {formatDate(link.lastClicked)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}