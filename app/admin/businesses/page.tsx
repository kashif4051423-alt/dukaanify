'use client';

import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Business {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  store_link: string;
}

export default function ActiveBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<'table' | 'csv' | 'json'>('table');

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveBusinessesWithLinks();
        setBusinesses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'کچھ غلط ہوگیا');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const downloadCSV = () => {
    const csv = [
      'ID,Name,Slug,Owner ID,Store Link',
      ...businesses.map(
        (b) => `"${b.id}","${b.name}","${b.slug}","${b.owner_id}","${b.store_link}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    const json = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        total_count: businesses.length,
        businesses,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">لوڈ ہو رہا ہے...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Businesses</h1>
          <p className="text-gray-600">کل: {businesses.length} stores</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setFormat('table')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              format === 'table'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📊 Table
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              format === 'csv'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 CSV
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              format === 'json'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {} JSON
          </button>
          <div className="flex-1"></div>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            ⬇️ CSV Download
          </button>
          <button
            onClick={downloadJSON}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            ⬇️ JSON Download
          </button>
        </div>

        {/* Content */}
        {businesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">کوئی active business نہیں ملا</p>
          </div>
        ) : format === 'table' ? (
          // Table View
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Owner ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Store Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {businesses.map((business, index) => (
                  <tr key={business.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{business.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded">{business.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {business.owner_id.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={business.store_link}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-700 underline"
                      >
                        Visit Store →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : format === 'csv' ? (
          // CSV View
          <div className="bg-white rounded-lg shadow p-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {[
                'ID,Name,Slug,Owner ID,Store Link',
                ...businesses.map(
                  (b) => `"${b.id}","${b.name}","${b.slug}","${b.owner_id}","${b.store_link}"`
                ),
              ].join('\n')}
            </pre>
          </div>
        ) : (
          // JSON View
          <div className="bg-white rounded-lg shadow p-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  total_count: businesses.length,
                  businesses,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
