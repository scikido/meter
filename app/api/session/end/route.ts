/**
 * Session End API Endpoint
 * Closes the Yellow Network app session and settles based on usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '../../../utils/sessionStore';
import { closeAppSession } from '../../../utils/sessionManager';

interface EndSessionRequest {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EndSessionRequest = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔚 ENDING SESSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🆔 Session ID:', sessionId);

    // Get session
    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log('📊 Session Stats:');
    console.log('  Usage Count:', session.usageCount);
    console.log('  Total Cost:', session.totalCost.toFixed(4));
    console.log('  Duration:', Math.round((Date.now() - session.startTime) / 1000), 'seconds');

    // Calculate final allocations
    const initialAmount = parseFloat(session.initialAllocations[0].amount);
    const finalUserAmount = Math.max(0, initialAmount - session.totalCost).toFixed(4);
    const finalPartnerAmount = Math.min(initialAmount, session.totalCost).toFixed(4);

    console.log('💰 Final allocations:');
    console.log('  User:', finalUserAmount);
    console.log('  Partner:', finalPartnerAmount);

    // Close app session on Yellow Network
    console.log('📤 Closing session on Yellow Network...');
    const closeResponse = await closeAppSession(
      session.yellowClient,
      session.appSessionId,
      session.userAddress as `0x${string}`,
      session.partnerAddress as `0x${string}`,
      session.sessionKey,
      session.partnerSessionKey,
      finalUserAmount,
      finalPartnerAmount
    );
    console.log('✅ Session closed on Yellow Network');

    // Remove session from store
    sessionStore.delete(sessionId);
    console.log('🗑️ Session removed from store');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SESSION ENDED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      sessionId,
      appSessionId: session.appSessionId,
      summary: {
        usageCount: session.usageCount,
        totalCost: session.totalCost,
        duration: Date.now() - session.startTime,
        finalAllocations: {
          user: finalUserAmount,
          partner: finalPartnerAmount,
        },
      },
      closeResponse,
    });

  } catch (error: any) {
    console.error('❌ Session end error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
