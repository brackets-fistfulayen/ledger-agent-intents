import { useState, useEffect, useCallback } from 'react';
import { useWalletAPIClient } from '@ledgerhq/wallet-api-client-react';
import type { Intent } from '@agent-intents/shared';
import { IntentCard } from './components/IntentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user';
const POLL_INTERVAL = 5000; // Poll every 5 seconds

export default function App() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);

  const { client } = useWalletAPIClient();

  // Fetch intents from backend
  const fetchIntents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${USER_ID}/intents`);
      const data = await res.json();
      if (data.success) {
        setIntents(data.intents);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch intents');
      }
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for updates
  useEffect(() => {
    fetchIntents();
    const interval = setInterval(fetchIntents, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchIntents]);

  // Update intent status
  const updateStatus = async (intentId: string, status: string, txHash?: string) => {
    try {
      await fetch(`${API_URL}/api/intents/${intentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, txHash }),
      });
      fetchIntents();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Sign intent using Wallet API
  const handleSign = async (intent: Intent) => {
    if (!client) {
      setError('Wallet API not available - run inside Ledger Live');
      return;
    }

    setSigningId(intent.id);
    
    try {
      // First, mark as approved
      await updateStatus(intent.id, 'approved');
      
      // Request account from user
      const account = await client.account.request({
        currencyIds: [intent.details.chainId === 137 ? 'polygon' : 'ethereum'],
      });
      
      if (!account) {
        await updateStatus(intent.id, 'rejected', undefined);
        return;
      }

      // Build transaction
      // For ERC-20 transfers, we need to build the contract call
      const tx = {
        family: 'ethereum' as const,
        amount: BigInt(0), // For ERC-20, amount is in data
        recipient: intent.details.tokenAddress || intent.details.recipient,
        // TODO: Build proper ERC-20 transfer data
        // For hackathon demo, we'll simplify
      };

      // Sign and broadcast
      const result = await client.transaction.signAndBroadcast(
        account.id,
        tx,
        { hwAppId: 'Ethereum' }
      );

      // Update status with tx hash
      await updateStatus(intent.id, 'signed', result);
      
      // Note: In production, we'd monitor for confirmation
      setTimeout(() => updateStatus(intent.id, 'confirmed'), 10000);
      
    } catch (err) {
      console.error('Signing error:', err);
      await updateStatus(intent.id, 'failed');
    } finally {
      setSigningId(null);
    }
  };

  // Reject intent
  const handleReject = async (intent: Intent) => {
    await updateStatus(intent.id, 'rejected');
  };

  const pendingIntents = intents.filter(i => i.status === 'pending');
  const historyIntents = intents.filter(i => i.status !== 'pending');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 Agent Intents</h1>
        <p style={styles.subtitle}>Review and sign transactions proposed by your AI agents</p>
      </header>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading intents...</div>
      ) : (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Pending Approval ({pendingIntents.length})
            </h2>
            {pendingIntents.length === 0 ? (
              <p style={styles.empty}>No pending intents. Your agents are quiet.</p>
            ) : (
              pendingIntents.map(intent => (
                <IntentCard
                  key={intent.id}
                  intent={intent}
                  onSign={() => handleSign(intent)}
                  onReject={() => handleReject(intent)}
                  signing={signingId === intent.id}
                />
              ))
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>History</h2>
            {historyIntents.length === 0 ? (
              <p style={styles.empty}>No transaction history yet.</p>
            ) : (
              historyIntents.slice(0, 10).map(intent => (
                <IntentCard
                  key={intent.id}
                  intent={intent}
                  readonly
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 20,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: '#aaa',
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    background: '#1a1a1a',
    borderRadius: 12,
  },
  error: {
    background: '#3a1a1a',
    color: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
};
