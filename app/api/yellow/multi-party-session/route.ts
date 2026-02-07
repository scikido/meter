/**
 * Multi-Party Application Session API
 * Based on: https://github.com/stevenzeiler/yellow-sdk-tutorials/tree/main/scripts/app_sessions
 */

import { NextResponse } from 'next/server';
import { Client } from "yellow-ts";
import { createWalletClient, http, WalletClient } from "viem";
import { base } from "viem/chains";
import { mnemonicToAccount, generatePrivateKey } from "viem/accounts";
import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  createSubmitAppStateMessage,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import {  authenticateWallet } from "../../../utils/auth";

export async function POST() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 STARTING MULTI-PARTY SESSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // STEP 1: Connect to Yellow Network
    console.log('\n📡 STEP 1: Connecting to Yellow Network...');
    const yellow = new Client({
      url: 'wss://clearnet-sandbox.yellow.com/ws',
    });

    await yellow.connect();
    console.log('✅ Connected to wss://clearnet-sandbox.yellow.com/ws');

    // STEP 2: Set Up Both Participants' Wallets
    console.log('\n👛 STEP 2: Setting up wallet clients...');
    const walletClient = createWalletClient({
      account: mnemonicToAccount(process.env.WALLET_1_SEED_PHRASE as string),
      chain: base,
      transport: http(),
    });

    const wallet2Client = createWalletClient({
      account: mnemonicToAccount(process.env.WALLET_2_SEED_PHRASE as string),
      chain: base,
      transport: http(),
    });

    const userAddress = walletClient.account?.address as `0x${string}`;
    const partnerAddress = wallet2Client.account?.address as `0x${string}`;
    console.log('✅ Wallet 1 (User):', userAddress);
    console.log('✅ Wallet 2 (Partner):', partnerAddress);

    // STEP 3: Create Session Keys & Signers
    console.log('\n🔑 STEP 3: Generating session keys...');
    const sessionKey = await authenticateWallet(yellow, walletClient as WalletClient);
    const messageSigner = createECDSAMessageSigner(sessionKey.privateKey);
    console.log('✅ Session key 1 generated');

    const sessionKey2 = await authenticateWallet(yellow, wallet2Client as WalletClient);
    const messageSigner2 = createECDSAMessageSigner(sessionKey2.privateKey);
    console.log('✅ Session key 2 generated');

    // STEP 4: Define Application Configuration
    console.log('\n📋 STEP 4: Defining app configuration...');
    const appDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [userAddress, partnerAddress],
      weights: [50, 50],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
      application: 'Test app',
    };
    console.log('📋 App Definition:', JSON.stringify(appDefinition, null, 2));

    // STEP 5: Set Initial Allocations
    console.log('\n💰 STEP 5: Setting initial allocations...');
    const allocations = [
      { participant: userAddress, asset: 'ytest.usd', amount: '0.01' },
      { participant: partnerAddress, asset: 'ytest.usd', amount: '0.00' }
    ] as RPCAppSessionAllocation[];
    console.log('💰 Initial Allocations:', JSON.stringify(allocations, null, 2));

    // STEP 6: Create and Submit App Session
    console.log('\n📝 STEP 6: Creating app session message...');
    const sessionMessage = await createAppSessionMessage(
      messageSigner,
      { definition: appDefinition, allocations }
    );
    console.log('� SENDING session message to Yellow Network...');
    console.log('📦 Message:', sessionMessage);

    const sessionResponse = await yellow.sendMessage(sessionMessage) as any;
    console.log('📥 RECEIVED session response:', JSON.stringify(sessionResponse, null, 2));

    const appSessionId = sessionResponse?.params?.appSessionId || 'session-' + Date.now();
    console.log('🆔 App Session ID:', appSessionId);

    // STEP 7: Update Session State
    console.log('\n📊 STEP 7: Creating state update (transfer 0.01 USDC to partner)...');
    const finalAllocations = [
      { participant: userAddress, asset: 'ytest.usd', amount: '0.00' },
      { participant: partnerAddress, asset: 'ytest.usd', amount: '0.01' }
    ] as RPCAppSessionAllocation[];
    console.log('💰 Final Allocations:', JSON.stringify(finalAllocations, null, 2));

    const submitAppStateMessage = await createSubmitAppStateMessage(
      messageSigner,
      { app_session_id: appSessionId, allocations: finalAllocations }
    );
    console.log('� SENDING state update message...');
    console.log('📦 Message:', submitAppStateMessage);

    // STEP 8: Close Session with Multi-Party Signatures
    console.log('\n🔐 STEP 8: Creating close session message...');
    const closeSessionMessage = await createCloseAppSessionMessage(
      messageSigner,
      { app_session_id: appSessionId, allocations: finalAllocations }
    );
    console.log('📦 Close message (before 2nd signature):', closeSessionMessage);

    const closeSessionMessageJson = JSON.parse(closeSessionMessage);

    // STEP 9: Collect Second Participant's Signature
    console.log('\n✍️ STEP 9: Collecting second participant signature...');
    const signature2 = await messageSigner2(closeSessionMessageJson.req as RPCData);
    console.log('✅ Signature 2:', signature2);
    
    closeSessionMessageJson.sig.push(signature2);
    console.log('📦 Close message (with both signatures):', JSON.stringify(closeSessionMessageJson, null, 2));

    // STEP 10: Submit Close Request
    console.log('\n📤 STEP 10: Sending close session message...');
    const closeSessionResponse = await yellow.sendMessage(
      JSON.stringify(closeSessionMessageJson)
    );
    console.log('📥 RECEIVED close response:', JSON.stringify(closeSessionResponse, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SESSION COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      appSessionId,
      participants: { user: userAddress, partner: partnerAddress },
      initialAllocations: allocations,
      finalAllocations,
      sessionResponse,
      closeSessionResponse,
    });

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message || error);
    console.error('Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
