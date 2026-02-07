/**
 * Multi-Party Application Session Script
 * Based on: https://github.com/stevenzeiler/yellow-sdk-tutorials/tree/main/scripts/app_sessions
 * 
 * Run: npx tsx scripts/app_session_two_signers.ts
 */

import { Client } from "yellow-ts";
import { createWalletClient, http, WalletClient } from "viem";
import { base } from "viem/chains";
import { mnemonicToAccount, generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  createSubmitAppStateMessage,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
  RPCResponse,
} from "@erc7824/nitrolite";

export async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 STARTING MULTI-PARTY SESSION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ============================================================================
  // STEP 1: Connect to Yellow Network
  // ============================================================================
  console.log('\n📡 STEP 1: Connecting to Yellow Network...');
  const yellow = new Client({
    url: 'wss://clearnet-sandbox.yellow.com/ws',
  });

  await yellow.connect();
  console.log('✅ Connected to wss://clearnet-sandbox.yellow.com/ws');

  // ============================================================================
  // STEP 2: Set Up Both Participants' Wallets
  // ============================================================================
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

  // ============================================================================
  // STEP 3: Create Session Keys & Signers
  // ============================================================================
  console.log('\n🔑 STEP 3: Generating session keys...');
  const sessionKeyPrivate = generatePrivateKey();
  const messageSigner = createECDSAMessageSigner(sessionKeyPrivate);
  console.log('✅ Session key 1 generated');

  const sessionKey2Private = generatePrivateKey();
  const messageSigner2 = createECDSAMessageSigner(sessionKey2Private);
  console.log('✅ Session key 2 generated');

  // ============================================================================
  // STEP 4: Define Application Configuration
  // ============================================================================
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

  // ============================================================================
  // STEP 5: Set Initial Allocations
  // ============================================================================
  console.log('\n💰 STEP 5: Setting initial allocations...');
  const allocations = [
    { participant: userAddress, asset: 'ytest.usd', amount: '0.01' },
    { participant: partnerAddress, asset: 'ytest.usd', amount: '0.00' }
  ] as RPCAppSessionAllocation[];
  console.log('💰 Initial Allocations:', JSON.stringify(allocations, null, 2));

  // ============================================================================
  // STEP 6: Create and Submit App Session
  // ============================================================================
  console.log('\n📝 STEP 6: Creating app session message...');
  const sessionMessage = await createAppSessionMessage(
    messageSigner,
    { definition: appDefinition, allocations }
  );
  console.log('📦 Session message created:', sessionMessage);

  console.log('📤 SENDING session message to Yellow Network...');
  const sessionResponse = await yellow.sendMessage(sessionMessage) as any;
  console.log('📥 RECEIVED session response:', JSON.stringify(sessionResponse, null, 2));

  const appSessionId = sessionResponse?.params?.appSessionId;
  console.log('🆔 App Session ID:', appSessionId);

  // ============================================================================
  // STEP 7: Update Session State (Transfer Between Participants)
  // ============================================================================
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
  console.log('📦 State update message:', submitAppStateMessage);

  // ============================================================================
  // STEP 8: Close Session with Multi-Party Signatures
  // ============================================================================
  console.log('\n🔐 STEP 8: Creating close session message...');
  const closeSessionMessage = await createCloseAppSessionMessage(
    messageSigner,
    { app_session_id: appSessionId, allocations: finalAllocations }
  );

  const closeSessionMessageJson = JSON.parse(closeSessionMessage);
  console.log('📦 Close message (signed by wallet 1):', JSON.stringify(closeSessionMessageJson, null, 2));

  // ============================================================================
  // STEP 9: Collect Second Participant's Signature
  // ============================================================================
  console.log('\n✍️ STEP 9: Collecting second participant signature...');
  const signature2 = await messageSigner2(closeSessionMessageJson.req as RPCData);
  console.log('✅ Wallet 2 signature:', signature2);

  closeSessionMessageJson.sig.push(signature2);
  console.log('📦 Close message (with BOTH signatures):', JSON.stringify(closeSessionMessageJson, null, 2));

  // ============================================================================
  // STEP 10: Submit Close Request
  // ============================================================================
  console.log('\n📤 STEP 10: Sending close session message...');
  const closeSessionResponse = await yellow.sendMessage(
    JSON.stringify(closeSessionMessageJson)
  );
  console.log('📥 RECEIVED close response:', JSON.stringify(closeSessionResponse, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SESSION COMPLETED SUCCESSFULLY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Listen for any additional messages from the server
  yellow.listen(async (message: RPCResponse) => {
    console.log('📨 Received message:', message);
  });
}

// Run if executed directly
main().catch((error) => {
  console.error('❌ Error:', error.message || error);
  console.error('Stack:', error.stack);
  process.exitCode = 1;
});
