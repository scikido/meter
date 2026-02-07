'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';

interface SessionAuth {
  address: string;
  sessionKey: {
    address: string;
    privateKey: string;
  };
  expiresAt: number;
}

export default function Hero() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [sessionAuth, setSessionAuth] = useState<SessionAuth | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Simple wallet connect with ethers
  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        setError('MetaMask not installed');
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAddress(addr);
      addLog(`✅ Wallet connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    }
  };

  const authenticateWithYellow = async () => {
    if (!address) return;

    setAuthenticating(true);
    setError(null);
    addLog('🔐 Authenticating with Yellow Network...');

    try {
      const response = await fetch('/api/yellow/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSessionAuth(data);
      addLog('✅ Authenticated with Yellow Network');
      addLog(`🔑 Session key: ${data.sessionKey.address.slice(0, 10)}...`);
    } catch (err: any) {
      setError(err.message);
      addLog(`❌ Auth Error: ${err.message}`);
    } finally {
      setAuthenticating(false);
    }
  };

  const runSession = async () => {
    if (!sessionAuth) return;

    setLoading(true);
    setError(null);
    addLog('🔌 Starting multi-party session...');

    try {
      const response = await fetch('/api/yellow/multi-party-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Session failed');
      }

      addLog('✅ Session completed');
      addLog(`📝 Session ID: ${data.appSessionId}`);
      addLog('🎉 Done!');

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
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Multi-Party Session Demo
            </h1>
            <p className="text-slate-400 text-lg">
              Yellow Network • Nitrolite State Channels
            </p>
          </div>

          {/* Wallet Connect Button */}
          {address ? (
            <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 px-4 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="space-y-3">
            {!address && (
              <p className="text-slate-400 text-center py-4">
                👆 Connect your wallet to get started
              </p>
            )}

            {address && !sessionAuth && (
              <button
                onClick={authenticateWithYellow}
                disabled={authenticating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-4 px-6 rounded-xl transition-all"
              >
                {authenticating ? 'Authenticating...' : 'Authenticate with Yellow Network'}
              </button>
            )}

            {sessionAuth && (
              <button
                onClick={runSession}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium py-4 px-6 rounded-xl transition-all"
              >
                {loading ? 'Running...' : 'Run Multi-Party Session'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 text-sm">✅ Session completed: {result.appSessionId}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Log</h2>
          <div className="bg-slate-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500">Connect your wallet to begin.</p>
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
