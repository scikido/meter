/**
 * Session Start API Endpoint
 * Creates a new Yellow Network app session using working multi-party logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'yellow-ts';
import { createWalletClient, http, WalletClient } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  createAppSessionMessage,
  createECDSAMessageSigner,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCProtocolVersion,
} from '@erc7824/nitrolite';
import { sessionStore } from '../../../utils/sessionStore';
import { authenticateWallet } from '../../../utils/auth';

interface StartSessionRequest {
  userAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartSessionRequest = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 STARTING SESSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User Address:', userAddress);

    // Check if user already has an active session
    const existingSession = sessionStore.getByUserAddress(userAddress);
    if (existingSession) {
      console.log('⚠️ User already has an active session:', existingSession.sessionId);
      return NextResponse.json({
        error: 'User already has an active session',
        sessionId: existingSession.sessionId,
      }, { status: 400 });
    }

    // STEP 1: Connect to Yellow Network
    console.log('\n📡 STEP 1: Connecting to Yellow Network...');
    const yellow = new Client({
      url: 'wss://clearnet-sandbox.yellow.com/ws',
    });
    await yellow.connect();
    console.log('✅ Connected to Yellow Network');

    // STEP 2: Set up both wallets (using seed phrases for now)
    console.log('\n👛 STEP 2: Setting up wallet clients...');
    
    // For now, use WALLET_1_SEED_PHRASE for the user wallet
    // TODO: Replace with MetaMask integration
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

    const wallet1Address = walletClient.account?.address as `0x${string}`;
    const partnerAddress = wallet2Client.account?.address as `0x${string}`;
    
    console.log('✅ Wallet 1 (User):', wallet1Address);
    console.log('✅ Wallet 2 (Partner):', partnerAddress);

    // STEP 3: Authenticate both wallets and generate session keys
    console.log('\n🔑 STEP 3: Authenticating wallets...');
    const sessionKey = await authenticateWallet(yellow, walletClient as WalletClient);
    const messageSigner = createECDSAMessageSigner(sessionKey.privateKey);
    console.log('✅ Wallet 1 authenticated. Session key:', sessionKey.address);

    const sessionKey2 = await authenticateWallet(yellow, wallet2Client as WalletClient);
    const messageSigner2 = createECDSAMessageSigner(sessionKey2.privateKey);
    console.log('✅ Wallet 2 authenticated. Session key:', sessionKey2.address);

    // STEP 4: Define app configuration
    console.log('\n📋 STEP 4: Defining app configuration...');
    const appDefinition: RPCAppDefinition = {
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: [wallet1Address, partnerAddress],
      weights: [50, 50],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
      application: 'Test app',
    };
    console.log('📋 App Definition:', JSON.stringify(appDefinition, null, 2));

    // STEP 5: Set initial allocations
    console.log('\n💰 STEP 5: Setting initial allocations...');
    const allocations = [
      { participant: wallet1Address, asset: 'ytest.usd', amount: '0.01' },
      { participant: partnerAddress, asset: 'ytest.usd', amount: '0.00' }
    ] as RPCAppSessionAllocation[];
    console.log('💰 Initial Allocations:', JSON.stringify(allocations, null, 2));

    // STEP 6: Create and submit app session
    console.log('\n📝 STEP 6: Creating app session message...');
    const sessionMessage = await createAppSessionMessage(
      messageSigner,
      { definition: appDefinition, allocations }
    );
    console.log('📤 Sending session message to Yellow Network...');

    const sessionResponse = await yellow.sendMessage(sessionMessage) as any;
    console.log('📥 Received session response:', JSON.stringify(sessionResponse, null, 2));

    const appSessionId = sessionResponse?.params?.appSessionId;
    
    if (!appSessionId) {
      console.error('❌ No app_session_id in response!');
      throw new Error('Yellow Network did not return an app_session_id');
    }
    
    console.log('🆔 App Session ID:', appSessionId);

    // Store session data with separate sessionId
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    sessionStore.set(sessionId, {
      sessionId,
      appSessionId,
      userAddress: wallet1Address,
      partnerAddress,
      yellowClient: yellow,
      sessionKey,
      partnerSessionKey: sessionKey2,
      usageCount: 0,
      totalCost: 0,
      startTime: Date.now(),
      initialAllocations: allocations,
    });

    console.log('💾 Session stored with ID:', sessionId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SESSION STARTED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      sessionId,
      appSessionId,
      userAddress: wallet1Address,
      partnerAddress,
      startTime: Date.now(),
      initialAllocations: allocations,
    });

  } catch (error: any) {
    console.error('❌ Session start error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
