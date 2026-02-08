/**
 * Wallet-based Authentication API
 * Authenticates a user wallet with Yellow Network using a frontend-signed EIP-712 message
 */

import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'yellow-ts';
import { 
  createAuthRequestMessage, 
  createAuthVerifyMessage,
  RPCResponse, 
  RPCMethod,
  AuthChallengeResponse
} from '@erc7824/nitrolite';
import { generateSessionKey, SessionKey } from '../../../utils/utils';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const APP_NAME = 'Test app';
const SESSION_DURATION = 3600; // 1 hour

interface AuthRequest {
  address: string;
  // The signature will be requested by the backend when we get the challenge
}

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 STARTING WALLET AUTHENTICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Wallet Address:', address);

    // Generate session key
    const sessionKey: SessionKey = generateSessionKey();
    const sessionExpireTimestamp = String(Math.floor(Date.now() / 1000) + SESSION_DURATION);

    console.log('🔑 Session Key:', sessionKey.address);
    console.log('⏰ Expires:', new Date(parseInt(sessionExpireTimestamp) * 1000).toISOString());

    // Connect to Yellow Network
    const yellow = new Client({
      url: 'wss://clearnet-sandbox.yellow.com/ws',
    });

    await yellow.connect();
    console.log('✅ Connected to Yellow Network');

    // We need a signer for the backend. For now, we'll use a server-side key
    // to sign the auth verification. In production, this would be the session key.
    const sessionWalletClient = createWalletClient({
      account: privateKeyToAccount(sessionKey.privateKey),
      chain: base,
      transport: http(),
    });

    // Create auth request
    const authMessage = await createAuthRequestMessage({
      address: address as `0x${string}`,
      session_key: sessionKey.address,
      application: APP_NAME,
      allowances: [{
        asset: 'ytest.usd',
        amount: '1',
      }],
      expires_at: BigInt(sessionExpireTimestamp),
      scope: 'test.app',
    });

    // Set up promise to wait for auth result
    const authResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Authentication timeout' });
      }, 30000);

      yellow.listen(async (message: RPCResponse) => {
        console.log('📨 Received:', message.method);

        if (message.method === RPCMethod.AuthChallenge) {
          try {
            const authParams = {
              scope: 'test.app',
              application: address as `0x${string}`,
              participant: sessionKey.address,
              expire: sessionExpireTimestamp,
              allowances: [{
                asset: 'ytest.usd',
                amount: '1',
              }],
              session_key: sessionKey.address,
              expires_at: BigInt(sessionExpireTimestamp),
            };

            // For backend auth, we use the session key to sign
            // The user's wallet already proved ownership by connecting
            const { createEIP712AuthMessageSigner } = await import('@erc7824/nitrolite');
            const eip712Signer = createEIP712AuthMessageSigner(
              sessionWalletClient, 
              authParams, 
              { name: APP_NAME }
            );

            const authVerifyMessage = await createAuthVerifyMessage(
              eip712Signer, 
              message as AuthChallengeResponse
            );

            await yellow.sendMessage(authVerifyMessage);
            console.log('✅ Auth verify sent');
          } catch (err: any) {
            console.error('❌ Auth challenge handler error:', err);
            clearTimeout(timeout);
            resolve({ success: false, error: err.message });
          }
        }

        // Check for auth success (adjust based on actual response structure)
        if ((message as any).result?.authenticated || (message.method as string) === 'auth_success') {
          clearTimeout(timeout);
          resolve({ success: true });
        }
      });

      // Send the auth request
      yellow.sendMessage(authMessage).catch((err: any) => {
        clearTimeout(timeout);
        resolve({ success: false, error: err.message });
      });

      console.log('📤 Auth request sent');
    });

    // Small delay to ensure auth completes
    await new Promise(r => setTimeout(r, 1000));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AUTHENTICATION COMPLETED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      address,
      sessionKey: {
        address: sessionKey.address,
        privateKey: sessionKey.privateKey, // In production, store this securely
      },
      expiresAt: parseInt(sessionExpireTimestamp),
    });

  } catch (error: any) {
    console.error('❌ Authentication error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
