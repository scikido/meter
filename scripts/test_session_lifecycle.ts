/**
 * Test Client for Complete Session Lifecycle
 * Demonstrates: Create → Use → Stop & Settle
 * 
 * Run: npx tsx scripts/test_session_lifecycle.ts
 */

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const USER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // Replace with actual address
const INITIAL_AMOUNT = '0.01';
const COST_PER_USE = 0.001;
const NUMBER_OF_USES = 10;

async function testSessionLifecycle() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTING COMPLETE SESSION LIFECYCLE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // ========================================================================
        // STEP 1: Create Session
        // ========================================================================
        console.log('\n📝 STEP 1: Starting session...');
        console.log('User Address:', USER_ADDRESS);
        console.log('Initial Amount:', INITIAL_AMOUNT, 'ytest.usd');

        const startResponse = await fetch(`${API_BASE_URL}/api/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAddress: USER_ADDRESS,
                initialAmount: INITIAL_AMOUNT,
            }),
        });

        if (!startResponse.ok) {
            const error = await startResponse.json();
            throw new Error(`Start session failed: ${JSON.stringify(error)}`);
        }

        const startData = await startResponse.json();
        console.log('✅ Session started successfully!');
        console.log('Session ID:', startData.sessionId);
        console.log('App Session ID:', startData.appSessionId);
        console.log('Initial Allocations:', startData.initialAllocations);

        const sessionId = startData.sessionId;

        // ========================================================================
        // STEP 2: Increment Usage Multiple Times
        // ========================================================================
        console.log('\n📊 STEP 2: Incrementing usage...');
        console.log(`Will increment ${NUMBER_OF_USES} times at ${COST_PER_USE} each`);

        for (let i = 1; i <= NUMBER_OF_USES; i++) {
            console.log(`\n  📈 Usage #${i}/${NUMBER_OF_USES}`);

            const incrementResponse = await fetch(`${API_BASE_URL}/api/session/increment-usage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    cost: COST_PER_USE,
                }),
            });

            if (!incrementResponse.ok) {
                const error = await incrementResponse.json();
                throw new Error(`Increment usage failed: ${JSON.stringify(error)}`);
            }

            const incrementData = await incrementResponse.json();
            console.log('  ✅ Usage incremented');
            console.log('  Total usage:', incrementData.usageCount);
            console.log('  Total cost:', incrementData.totalCost.toFixed(4));
            console.log('  Current allocations:', incrementData.allocations);

            // Small delay to avoid overwhelming the network
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n✅ All usage increments completed!');

        // ========================================================================
        // STEP 3: End Session & Settle
        // ========================================================================
        console.log('\n🛑 STEP 3: Ending session and settling...');

        const endResponse = await fetch(`${API_BASE_URL}/api/session/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        if (!endResponse.ok) {
            const error = await endResponse.json();
            throw new Error(`End session failed: ${JSON.stringify(error)}`);
        }

        const endData = await endResponse.json();
        console.log('✅ Session ended and settled successfully!');
        console.log('\n📊 FINAL SETTLEMENT:');
        console.log('  Total Usage:', endData.summary.usageCount);
        console.log('  Total Cost:', endData.summary.totalCost.toFixed(4), 'ytest.usd');
        console.log('\n💰 Final Allocations:');
        console.log('  User:', endData.summary.finalAllocations.user, 'ytest.usd');
        console.log('  Partner:', endData.summary.finalAllocations.partner, 'ytest.usd');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error: any) {
        console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ TEST FAILED');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exitCode = 1;
    }
}

// Run the test
testSessionLifecycle();
