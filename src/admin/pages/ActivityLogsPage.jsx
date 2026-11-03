import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getActivityLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Administrative Activity Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Immutable security log recording staff logins, stock alterations, pricing edits, and order dispatches.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-1.5 text-xs bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-semibold rounded-lg transition-colors border border-[#E8E2D9]"
        >
          Refresh Logs
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Staff Identity</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Module & ID</th>
                <th className="py-3 px-4 font-semibold">Audit Details</th>
                <th className="py-3 px-4 font-semibold text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#81766E]">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#29201E]">{log.user_name || 'System'}</p>
                    <p className="text-[10px] text-[#81766E]">{log.user_email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#F5EEE5] text-[#4A0715] border border-[#E8E2D9]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#70594B]">
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                  </td>
                  <td className="py-3 px-4 text-[#29201E] max-w-xs truncate font-mono text-[10px]">
                    {log.details || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[10px] text-[#81766E]">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-[#81766E]">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

