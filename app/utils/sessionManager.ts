/**
 * Session lifecycle management utilities
 * Helpers for creating, updating, and closing Yellow Network app sessions
 */

import { Client } from 'yellow-ts';
import { createWalletClient, http, WalletClient } from 'viem';
import { mnemonicToAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  createSubmitAppStateMessage,
  RPCAppDefinition,
  RPCAppSessionAllocation,
  RPCData,
  RPCProtocolVersion,
} from '@erc7824/nitrolite';
import { authenticateWallet } from './auth';

const APP_NAME = 'Meter';
const YELLOW_WS_URL = 'wss://clearnet-sandbox.yellow.com/ws';

export interface SessionKey {
  address: string;
  privateKey: `0x${string}`;
}

/**
 * Create and connect to Yellow Network
 */
export async function createYellowClient(): Promise<Client> {
  console.log('📡 [createYellowClient] Creating Yellow client...');
  console.log('📡 [createYellowClient] Sandbox URL:', YELLOW_WS_URL);
  
  const yellow = new Client({ url: YELLOW_WS_URL });
  
  console.log('📡 [createYellowClient] Connecting to Yellow Network...');
  await yellow.connect();
  
  console.log('✅ [createYellowClient] Connected successfully');
  return yellow;
}

/**
 * Generate a session key
 */
export function generateSessionKey(): SessionKey {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return {
    address: account.address,
    privateKey,
  };
}

/**
 * Create an app session with authentication
 * Authenticates partner wallet and generates authenticated session keys for both parties
 */
export async function createAppSession(
  yellowClient: Client,
  userAddress: `0x${string}`,
  partnerAddress: `0x${string}`,
  partnerWalletClient: WalletClient,
  initialAmount: string = '0.01'
): Promise<{ appSessionId: string; userSessionKey: SessionKey; partnerSessionKey: SessionKey }> {
  console.log('🔧 [createAppSession] Starting session creation...');
  console.log('🔧 [createAppSession] User:', userAddress);
  console.log('🔧 [createAppSession] Partner:', partnerAddress);
  console.log('🔧 [createAppSession] Initial amount:', initialAmount);

  // STEP 1: Authenticate partner wallet (generates session key)
  console.log('🔑 [createAppSession] Authenticating partner wallet...');
  const partnerSessionKey = await authenticateWallet(yellowClient, partnerWalletClient);
  console.log('✅ [createAppSession] Partner authenticated. Session key:', partnerSessionKey.address);

  // STEP 2: Generate session key for user (not authenticated, just generated)
  // Note: In a real multi-party setup, user would authenticate separately
  // For now, we generate a key that represents the user
  console.log('🔑 [createAppSession] Generating user session key...');
  const userSessionKey = generateSessionKey();
  console.log('✅ [createAppSession] User session key generated:', userSessionKey.address);

  // STEP 3: Use PARTNER's session key to sign (since they're authenticated)
  const messageSigner = createECDSAMessageSigner(partnerSessionKey.privateKey);

  // STEP 4: Create app definition
  const appDefinition: RPCAppDefinition = {
    protocol: RPCProtocolVersion.NitroRPC_0_4,
    participants: [userAddress, partnerAddress],
    weights: [50, 50],
    quorum: 100,
    challenge: 0,
    nonce: Date.now(),
    application: APP_NAME,
  };

  console.log('🔧 [createAppSession] App definition:', JSON.stringify(appDefinition, null, 2));

  // STEP 5: Create allocations
  const allocations: RPCAppSessionAllocation[] = [
    { participant: userAddress, asset: 'ytest.usd', amount: initialAmount },
    { participant: partnerAddress, asset: 'ytest.usd', amount: '0.00' },
  ];

  console.log('🔧 [createAppSession] Allocations:', JSON.stringify(allocations, null, 2));

  // STEP 6: Create and send session message (signed by partner)
  const sessionMessage = await createAppSessionMessage(messageSigner, {
    definition: appDefinition,
    allocations,
  });

  console.log('🔧 [createAppSession] Session message created:', sessionMessage.substring(0, 200) + '...');
  console.log('🔧 [createAppSession] Sending to Yellow Network...');

  const sessionResponse = (await yellowClient.sendMessage(sessionMessage)) as any;
  
  console.log('🔧 [createAppSession] Yellow Network response:', JSON.stringify(sessionResponse, null, 2));
  console.log('🔧 [createAppSession] Response params:', sessionResponse?.params);
  console.log('🔧 [createAppSession] App Session ID from response:', sessionResponse?.params?.appSessionId);

  const appSessionId = sessionResponse?.params?.appSessionId;
  
  if (!appSessionId) {
    console.error('❌ [createAppSession] CRITICAL: No app_session_id in Yellow response!');
    console.error('❌ [createAppSession] Full response:', JSON.stringify(sessionResponse, null, 2));
    throw new Error('Yellow Network did not return an app_session_id');
  }

  console.log('✅ [createAppSession] Session created successfully:', appSessionId);
  return { appSessionId, userSessionKey, partnerSessionKey };
}

/**
 * Update app session state
 */
export async function updateAppSessionState(
  yellowClient: Client,
  appSessionId: string,
  userAddress: `0x${string}`,
  partnerAddress: `0x${string}`,
  userSessionKey: SessionKey,
  userAmount: string,
  partnerAmount: string
): Promise<void> {
  const messageSigner = createECDSAMessageSigner(userSessionKey.privateKey);

  const allocations: RPCAppSessionAllocation[] = [
    { participant: userAddress, asset: 'ytest.usd', amount: userAmount },
    { participant: partnerAddress, asset: 'ytest.usd', amount: partnerAmount },
  ];

  const submitAppStateMessage = await createSubmitAppStateMessage(messageSigner, {
    app_session_id: appSessionId as `0x${string}`,
    allocations,
  });

  await yellowClient.sendMessage(submitAppStateMessage);
}

/**
 * Close app session with multi-party signatures
 */
export async function closeAppSession(
  yellowClient: Client,
  appSessionId: string,
  userAddress: `0x${string}`,
  partnerAddress: `0x${string}`,
  userSessionKey: SessionKey,
  partnerSessionKey: SessionKey,
  finalUserAmount: string,
  finalPartnerAmount: string
): Promise<any> {
  const messageSigner = createECDSAMessageSigner(userSessionKey.privateKey);
  const messageSigner2 = createECDSAMessageSigner(partnerSessionKey.privateKey);

  const finalAllocations: RPCAppSessionAllocation[] = [
    { participant: userAddress, asset: 'ytest.usd', amount: finalUserAmount },
    { participant: partnerAddress, asset: 'ytest.usd', amount: finalPartnerAmount },
  ];

  const closeSessionMessage = await createCloseAppSessionMessage(messageSigner, {
    app_session_id: appSessionId as `0x${string}`,
    allocations: finalAllocations,
  });

  const closeSessionMessageJson = JSON.parse(closeSessionMessage);

  // Add second participant's signature
  const signature2 = await messageSigner2(closeSessionMessageJson.req as RPCData);
  closeSessionMessageJson.sig.push(signature2);

  const closeSessionResponse = await yellowClient.sendMessage(
    JSON.stringify(closeSessionMessageJson)
  );

  return closeSessionResponse;
}

/**
 * Get partner wallet client from seed phrase
 */
export function getPartnerWalletClient() {
  if (!process.env.WALLET_2_SEED_PHRASE) {
    throw new Error('WALLET_2_SEED_PHRASE not set in environment');
  }

  return createWalletClient({
    account: mnemonicToAccount(process.env.WALLET_2_SEED_PHRASE),
    chain: base,
    transport: http(),
  });
}
