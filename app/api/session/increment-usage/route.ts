/**
 * Session Usage Increment API Endpoint
 * Updates session usage and state without closing the session
 * 
 * IMPORTANT: Enforces balance limits - users cannot exceed their allocated amount
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
  console.log('\n');
  console.log('┌─────────────────────────────────────────────────────────────────────┐');
  console.log('│                    📈 INCREMENT USAGE                                │');
  console.log('└─────────────────────────────────────────────────────────────────────┘');
  console.log('📅 Timestamp:', new Date().toISOString());

  try {
    const body: IncrementUsageRequest = await request.json();
    const { sessionId, cost = DEFAULT_COST_PER_USE } = body;

    console.log('📦 Request:', JSON.stringify(body, null, 2));
    console.log('🆔 Session ID:', sessionId);
    console.log('💵 Requested Cost:', cost);

    if (!sessionId) {
      console.error('❌ ERROR: Session ID required');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // ============================================================================
    // STEP 1: Get Session
    // ============================================================================
    console.log('\n📋 STEP 1: Retrieving session...');

    const session = sessionStore.get(sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      console.error('📋 Available sessions:', sessionStore.list().map(s => s.sessionId));
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log('✅ Session found');
    console.log('   ├─ User:', session.userAddress);
    console.log('   ├─ Current usage count:', session.usageCount);
    console.log('   └─ Current total cost:', session.totalCost.toFixed(6));

    // ============================================================================
    // STEP 2: Check Balance - ENFORCE ALLOCATION LIMIT
    // ============================================================================
    console.log('\n💰 STEP 2: Checking balance...');

    const initialAmount = parseFloat(session.initialAllocations[0].amount);
    const currentBalance = initialAmount - session.totalCost;
    const newTotalCost = session.totalCost + cost;

    console.log('   ├─ Initial allocation:', initialAmount.toFixed(6));
    console.log('   ├─ Already spent:', session.totalCost.toFixed(6));
    console.log('   ├─ Current balance:', currentBalance.toFixed(6));
    console.log('   ├─ This request cost:', cost.toFixed(6));
    console.log('   └─ New total if approved:', newTotalCost.toFixed(6));

    // CHECK: Does user have enough balance?
    if (cost > currentBalance) {
      console.error('❌ INSUFFICIENT BALANCE!');
      console.error('   ├─ Requested:', cost.toFixed(6));
      console.error('   ├─ Available:', currentBalance.toFixed(6));
      console.error('   └─ Shortfall:', (cost - currentBalance).toFixed(6));

      return NextResponse.json({
        error: 'Insufficient balance',
        details: {
          requested: cost,
          available: currentBalance,
          shortfall: cost - currentBalance,
        }
      }, { status: 402 }); // 402 Payment Required
    }

    console.log('✅ Balance check passed!');

    // ============================================================================
    // STEP 3: Increment Usage
    // ============================================================================
    console.log('\n📊 STEP 3: Incrementing usage...');

    const updatedSession = sessionStore.incrementUsage(sessionId, cost);
    if (!updatedSession) {
      console.error('❌ Failed to update session store');
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
    }

    console.log('✅ Usage incremented in store');
    console.log('   ├─ New usage count:', updatedSession.usageCount);
    console.log('   └─ New total cost:', updatedSession.totalCost.toFixed(6));

    // ============================================================================
    // STEP 4: Calculate New Allocations
    // ============================================================================
    console.log('\n💵 STEP 4: Calculating new allocations...');

    const userAmount = (initialAmount - updatedSession.totalCost).toFixed(6);
    const partnerAmount = updatedSession.totalCost.toFixed(6);

    console.log('   ├─ User balance:', userAmount);
    console.log('   └─ Partner balance:', partnerAmount);

    // ============================================================================
    // STEP 5: Update Yellow Network State
    // ============================================================================
    console.log('\n📤 STEP 5: Updating Yellow Network state...');

    await updateAppSessionState(
      updatedSession.yellowClient,
      updatedSession.appSessionId,
      updatedSession.userAddress as `0x${string}`,
      updatedSession.partnerAddress as `0x${string}`,
      updatedSession.sessionKey,
      userAmount,
      partnerAmount
    );

    console.log('✅ Yellow Network state updated');

    // ============================================================================
    // SUCCESS
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│                    🎉 USAGE INCREMENTED SUCCESSFULLY                 │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');
    console.log('📊 Summary:');
    console.log('   ├─ Usage count:', updatedSession.usageCount);
    console.log('   ├─ Total spent:', updatedSession.totalCost.toFixed(6));
    console.log('   ├─ Remaining balance:', userAmount);
    console.log('   └─ Partner earned:', partnerAmount);
    console.log('');

    return NextResponse.json({
      success: true,
      sessionId,
      usageCount: updatedSession.usageCount,
      totalCost: updatedSession.totalCost,
      remainingBalance: parseFloat(userAmount),
      allocations: {
        user: userAmount,
        partner: partnerAmount,
      },
    });

  } catch (error: any) {
    console.error('\n❌ INCREMENT USAGE ERROR');
    console.error('🔥 Error:', error.message);
    console.error('📍 Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
