'use client';

import { useState } from 'react';
import { Client } from 'yellow-ts'

export default function Hero() {
  const yellow = new Client({
    url: 'wss://clearnet-sandbox.yellow.com/ws',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runSession = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);

    addLog('🔌 Connecting to Yellow Network...');

    try {
      const response = await fetch('/api/yellow/multi-party-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed');
      }

      addLog('✅ Connected to Yellow clearnet');
      addLog(`👤 User: ${data.participants?.user}`);
      addLog(`👥 Partner: ${data.participants?.partner}`);
      addLog(`📝 Session ID: ${data.appSessionId}`);
      addLog('📊 Initial: User 0.01 USDC, Partner 0.00 USDC');
      addLog('💸 Transfer: 0.01 USDC → Partner');
      addLog('✍️ Both parties signed close message');
      addLog('🎉 Session closed successfully!');

      setResult(data);
    } catch (err: any) {
      setError(err.message);
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Multi-Party Session Demo
          </h1>
          <p className="text-slate-400 text-lg">
            Yellow Network • Nitrolite State Channels
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <button
            onClick={runSession}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium py-4 px-6 rounded-xl transition-all"
          >
            {loading ? 'Running...' : 'Run Multi-Party Session'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <span className="text-slate-400">Session ID: </span>
                <span className="text-white font-mono text-xs">{result.appSessionId}</span>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <span className="text-slate-400">User: </span>
                <span className="text-white font-mono text-xs">{result.participants?.user}</span>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <span className="text-slate-400">Partner: </span>
                <span className="text-white font-mono text-xs">{result.participants?.partner}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Log</h2>
          <div className="bg-slate-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500">Click the button to run the session flow.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-slate-300 py-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
