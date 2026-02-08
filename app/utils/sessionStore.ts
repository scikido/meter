/**
 * In-memory session state storage
 * Stores active sessions with their Yellow client connections and usage data
 * Uses globalThis to persist across Next.js hot reloads
 */

import { Client } from 'yellow-ts';

export interface SessionData {
  sessionId: string;
  appSessionId: string;
  userAddress: string;
  partnerAddress: string;
  yellowClient: Client;
  sessionKey: {
    address: string;
    privateKey: `0x${string}`;
  };
  partnerSessionKey: {
    address: string;
    privateKey: `0x${string}`;
  };
  usageCount: number;
  totalCost: number;
  startTime: number;
  initialAllocations: {
    participant: string;
    asset: string;
    amount: string;
  }[];
}

// Use globalThis to persist sessions across Next.js hot reloads
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, SessionData> | undefined;
};

// In-memory store (replace with database in production)
const sessions = globalForSessions.sessions ?? new Map<string, SessionData>();
globalForSessions.sessions = sessions;

export const sessionStore = {
  get(sessionId: string): SessionData | undefined {
    console.log('🔍 [sessionStore.get] Looking for:', sessionId);
    console.log('🔍 [sessionStore.get] Total sessions:', sessions.size);
    return sessions.get(sessionId);
  },

  set(sessionId: string, data: SessionData): void {
    console.log('💾 [sessionStore.set] Storing session:', sessionId);
    sessions.set(sessionId, data);
    console.log('💾 [sessionStore.set] Total sessions now:', sessions.size);
  },

  delete(sessionId: string): boolean {
    return sessions.delete(sessionId);
  },

  getByUserAddress(userAddress: string): SessionData | undefined {
    for (const session of sessions.values()) {
      if (session.userAddress.toLowerCase() === userAddress.toLowerCase()) {
        return session;
      }
    }
    return undefined;
  },

  incrementUsage(sessionId: string, cost: number): SessionData | undefined {
    const session = sessions.get(sessionId);
    if (session) {
      session.usageCount += 1;
      session.totalCost += cost;
      sessions.set(sessionId, session);
    }
    return session;
  },

  list(): SessionData[] {
    return Array.from(sessions.values());
  },

  clear(): void {
    sessions.clear();
  }
};
