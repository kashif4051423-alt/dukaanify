'use client'

import { useEffect, useState } from 'react'

interface AdminDataTableProps {
  title: string
  icon: React.ReactNode
  count: number
  columns: Array<{
    key: string
    label: string
  }>
  rows: Array<Record<string, React.ReactNode>>
  emptyMessage?: string
}

export function AdminDataTable({
  title,
  icon,
  count,
  columns,
  rows,
  emptyMessage = 'No data',
}: AdminDataTableProps) {
  const [visibleRows, setVisibleRows] = useState<number>(0)

  useEffect(() => {
    // Animate rows appearing
    let current = 0
    const interval = setInterval(() => {
      if (current < rows.length) {
        current++
        setVisibleRows(current)
      } else {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [rows.length])

  return (
    <style>{`
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .table-row {
        animation: slideInLeft 0.3s ease-out forwards;
      }
    `}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-slate-400">{icon}</span>
          <h2 className="font-semibold text-white">{title}</h2>
          <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all duration-300">
          {rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/30">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, visibleRows).map((row, idx) => (
                    <tr
                      key={idx}
                      className="table-row border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group"
                      style={{
                        animationDelay: `${idx * 50}ms`,
                      }}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4 text-slate-300">
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </style>
  )
}
