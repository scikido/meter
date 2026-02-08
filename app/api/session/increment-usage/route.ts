/**
 * Session Usage Increment API Endpoint
 * Updates session usage and state without closing the session
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '../../../utils/sessionStore';
import { updateAppSessionState } from '../../../utils/sessionManager';

interface IncrementUsageRequest {
  sessionId: string;
  cost?: number; // Cost per usage (default: 0.001)
}

const DEFAULT_COST_PER_USE = 0.001;

export async function POST(request: NextRequest) {
  try {
    const body: IncrementUsageRequest = await request.json();
    const { sessionId, cost = DEFAULT_COST_PER_USE } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 INCREMENT USAGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🆔 Session ID:', sessionId);

    // Get session
    const session = sessionStore.get(sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      console.error('📋 Available sessions:', sessionStore.list().map(s => s.sessionId));
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Increment usage
    const updatedSession = sessionStore.incrementUsage(sessionId, cost);
    if (!updatedSession) {
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
    }

    console.log('✅ Usage incremented:', updatedSession.usageCount);
    console.log('💰 Total cost:', updatedSession.totalCost.toFixed(4));

    // Calculate new allocations
    const initialAmount = parseFloat(updatedSession.initialAllocations[0].amount);
    const userAmount = Math.max(0, initialAmount - updatedSession.totalCost).toFixed(4);
    const partnerAmount = Math.min(initialAmount, updatedSession.totalCost).toFixed(4);

    console.log('📊 New allocations:');
    console.log('  User:', userAmount);
    console.log('  Partner:', partnerAmount);

    // Update app session state on Yellow Network
    console.log('📤 Updating Yellow Network state...');
    await updateAppSessionState(
      updatedSession.yellowClient,
      updatedSession.appSessionId,
      updatedSession.userAddress as `0x${string}`,
      updatedSession.partnerAddress as `0x${string}`,
      updatedSession.sessionKey,
      userAmount,
      partnerAmount
    );
    console.log('✅ State updated successfully');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 USAGE INCREMENTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      sessionId,
      usageCount: updatedSession.usageCount,
      totalCost: updatedSession.totalCost,
      allocations: {
        user: userAmount,
        partner: partnerAmount,
      },
    });

  } catch (error: any) {
    console.error('❌ Increment usage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
