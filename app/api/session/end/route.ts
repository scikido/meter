/**
 * Session End API Endpoint
 * ========================
 * 
 * Closes the Yellow Network app session with multi-party signatures and settles
 * the final allocations based on usage.
 * 
 * Based on: Yellow SDK Multi-Party Application Session Tutorial (STEPS 8-10)
 * 
 * Flow:
 * -----
 * 1. Retrieve session from store
 * 2. Calculate final allocations based on usage
 * 3. Create close session message (signed by first participant)
 * 4. Collect second participant's signature
 * 5. Submit close request with both signatures
 * 6. Remove session from store
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '../../../utils/sessionStore';
import {
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  RPCAppSessionAllocation,
  RPCData,
  RPCResponse,
} from '@erc7824/nitrolite';

interface EndSessionRequest {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🔚 END SESSION & SETTLEMENT                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('📅 Timestamp:', new Date().toISOString());

  try {
    // ============================================================================
    // STEP 1: Parse Request and Validate
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 1: Parsing Request                                             │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    const body: EndSessionRequest = await request.json();
    const { sessionId } = body;

    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    console.log('🆔 Session ID:', sessionId);

    if (!sessionId) {
      console.error('❌ ERROR: Session ID is required but not provided');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // ============================================================================
    // STEP 2: Retrieve Session from Store
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 2: Retrieving Session from Store                               │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    const session = sessionStore.get(sessionId);

    console.log('🔍 Looking up session in store...');
    console.log('📋 Available sessions:', sessionStore.list().map(s => ({
      sessionId: s.sessionId,
      appSessionId: s.appSessionId,
      userAddress: s.userAddress
    })));

    if (!session) {
      console.error('❌ ERROR: Session not found in store');
      console.error('   Requested sessionId:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    console.log('✅ Session found!');
    console.log('📊 Session Details:');
    console.log('   ├─ Session ID:', session.sessionId);
    console.log('   ├─ App Session ID:', session.appSessionId);
    console.log('   ├─ User Address:', session.userAddress);
    console.log('   ├─ Partner Address:', session.partnerAddress);
    console.log('   ├─ Usage Count:', session.usageCount);
    console.log('   ├─ Total Cost:', session.totalCost.toFixed(6));
    console.log('   ├─ Start Time:', new Date(session.startTime).toISOString());
    console.log('   ├─ Duration:', Math.round((Date.now() - session.startTime) / 1000), 'seconds');
    console.log('   └─ Initial Allocations:', JSON.stringify(session.initialAllocations, null, 2));

    // ============================================================================
    // STEP 3: Calculate Final Allocations
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 3: Calculating Final Allocations                               │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    const initialAmount = parseFloat(session.initialAllocations[0].amount);
    const finalUserAmount = Math.max(0, initialAmount - session.totalCost).toFixed(6);
    const finalPartnerAmount = Math.min(initialAmount, session.totalCost).toFixed(6);

    console.log('💰 Allocation Calculation:');
    console.log('   ├─ Initial Amount:', initialAmount.toFixed(6));
    console.log('   ├─ Total Cost (Usage):', session.totalCost.toFixed(6));
    console.log('   ├─ Final User Amount:', finalUserAmount);
    console.log('   └─ Final Partner Amount:', finalPartnerAmount);

    // Create final allocations array (matching Yellow SDK format)
    const finalAllocations: RPCAppSessionAllocation[] = [
      { participant: session.userAddress as `0x${string}`, asset: 'ytest.usd', amount: finalUserAmount },
      { participant: session.partnerAddress as `0x${string}`, asset: 'ytest.usd', amount: finalPartnerAmount }
    ];

    console.log('📋 Final Allocations Array:');
    console.log(JSON.stringify(finalAllocations, null, 2));

    // ============================================================================
    // STEP 4: Create Message Signers for Both Participants
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 4: Creating Message Signers                                    │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log('� Creating ECDSA message signer for User (Wallet 1)...');
    console.log('   ├─ Session Key Address:', session.sessionKey.address);
    const messageSigner = createECDSAMessageSigner(session.sessionKey.privateKey);
    console.log('   └─ ✅ Signer created');

    console.log('🔑 Creating ECDSA message signer for Partner (Wallet 2)...');
    console.log('   ├─ Session Key Address:', session.partnerSessionKey.address);
    const messageSigner2 = createECDSAMessageSigner(session.partnerSessionKey.privateKey);
    console.log('   └─ ✅ Signer created');

    // ============================================================================
    // STEP 5: Create Close Session Message (First Signature)
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 5: Creating Close Session Message (First Signature)            │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log('📝 Creating close session message...');
    console.log('   ├─ App Session ID:', session.appSessionId);
    console.log('   └─ Allocations:', JSON.stringify(finalAllocations));

    const closeSessionMessage = await createCloseAppSessionMessage(
      messageSigner,
      {
        app_session_id: session.appSessionId as `0x${string}`,
        allocations: finalAllocations
      }
    );

    console.log('✅ Close session message created (signed by Wallet 1)');
    console.log('📦 Raw message (truncated):', closeSessionMessage.substring(0, 200) + '...');

    // Parse the message to add additional signatures
    const closeSessionMessageJson = JSON.parse(closeSessionMessage);

    console.log('📋 Parsed Close Message Structure:');
    console.log('   ├─ req (request):', JSON.stringify(closeSessionMessageJson.req, null, 2).substring(0, 300) + '...');
    console.log('   └─ sig (signatures):', closeSessionMessageJson.sig?.length || 0, 'signature(s)');

    // ============================================================================
    // STEP 6: Collect Second Participant's Signature
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 6: Collecting Second Participant\'s Signature                   │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log('✍️  Signing with Wallet 2 (Partner)...');
    console.log('   ├─ Signing request data...');

    const signedCloseSessionMessageSignature2 = await messageSigner2(
      closeSessionMessageJson.req as RPCData
    );

    console.log('   └─ ✅ Wallet 2 signature generated');
    console.log('📝 Signature 2:', signedCloseSessionMessageSignature2.substring(0, 50) + '...');

    // Add the second signature to the message
    // Both signatures are required because quorum is 100%
    closeSessionMessageJson.sig.push(signedCloseSessionMessageSignature2);

    console.log('📋 Close message now has', closeSessionMessageJson.sig.length, 'signature(s)');
    console.log('   ├─ Signature 1 (User):', closeSessionMessageJson.sig[0]?.substring(0, 30) + '...');
    console.log('   └─ Signature 2 (Partner):', closeSessionMessageJson.sig[1]?.substring(0, 30) + '...');

    // ============================================================================
    // STEP 7: Submit Close Request to Yellow Network
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 7: Submitting Close Request to Yellow Network                  │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log('📤 Sending close session message to Yellow Network...');
    console.log('   ├─ WebSocket Client Connected:', !!session.yellowClient);
    console.log('   └─ Message Size:', JSON.stringify(closeSessionMessageJson).length, 'bytes');

    const closeSessionResponse = await session.yellowClient.sendMessage(
      JSON.stringify(closeSessionMessageJson)
    );
    session.yellowClient.listen(async (message: RPCResponse) => {
      console.log('📨 Received message:', JSON.stringify(message, null, 2));
    });
    console.log('✅ Close session message sent!');
    console.log('📥 Yellow Network Response:');
    console.log(JSON.stringify(closeSessionResponse, null, 2));

    // ============================================================================
    // STEP 8: Clean Up - Remove Session from Store
    // ============================================================================
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ STEP 8: Cleaning Up - Removing Session from Store                   │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log('🗑️  Removing session from store...');
    console.log('   ├─ Session ID:', sessionId);

    const deleted = sessionStore.delete(sessionId);

    console.log('   └─', deleted ? '✅ Session removed successfully' : '⚠️ Session was already removed');
    console.log('📋 Remaining sessions in store:', sessionStore.list().length);

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SESSION ENDED SUCCESSFULLY                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('📊 Final Summary:');
    console.log('   ├─ Session ID:', sessionId);
    console.log('   ├─ App Session ID:', session.appSessionId);
    console.log('   ├─ Total Usage Count:', session.usageCount);
    console.log('   ├─ Total Cost:', session.totalCost.toFixed(6));
    console.log('   ├─ Duration:', Math.round((Date.now() - session.startTime) / 1000), 'seconds');
    console.log('   ├─ Final User Balance:', finalUserAmount);
    console.log('   └─ Final Partner Balance:', finalPartnerAmount);
    console.log('');

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
      closeResponse: closeSessionResponse,
    });

  } catch (error: any) {
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ❌ SESSION END FAILED                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.error('🔥 Error Type:', error.constructor.name);
    console.error('💬 Error Message:', error.message);
    console.error('📍 Stack Trace:');
    console.error(error.stack);
    console.log('');

    return NextResponse.json({
      error: error.message,
      type: error.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
