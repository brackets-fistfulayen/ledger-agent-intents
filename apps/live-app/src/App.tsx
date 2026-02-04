import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import type { Intent } from '@agent-intents/shared';
import { IntentCard } from './components/IntentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user';
const POLL_INTERVAL = 5000;

// ERC-20 transfer function ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export default function App() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();

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

  // Sign and send transaction
  const handleSign = async (intent: Intent) => {
    if (!isConnected) {
      setError('Please connect your Ledger first');
      return;
    }

    setSigningId(intent.id);
    
    try {
      // Mark as approved
      await updateStatus(intent.id, 'approved');
      
      const { details } = intent;
      let txHash: string;

      if (details.tokenAddress) {
        // ERC-20 transfer
        const decimals = details.token === 'USDC' || details.token === 'USDT' ? 6 : 18;
        const amount = parseUnits(details.amount, decimals);
        
        const data = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [details.recipient as `0x${string}`, amount],
        });

        txHash = await sendTransactionAsync({
          to: details.tokenAddress as `0x${string}`,
          data,
        });
      } else {
        // Native ETH transfer
        const amount = parseUnits(details.amount, 18);
        
        txHash = await sendTransactionAsync({
          to: details.recipient as `0x${string}`,
          value: amount,
        });
      }

      // Update with tx hash
      await updateStatus(intent.id, 'signed', txHash);
      
      // Mark confirmed after a delay (in production, monitor the tx)
      setTimeout(() => updateStatus(intent.id, 'confirmed'), 15000);
      
    } catch (err: unknown) {
      console.error('Signing error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('rejected') || message.includes('denied')) {
        await updateStatus(intent.id, 'rejected');
      } else {
        await updateStatus(intent.id, 'failed');
      }
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
        
        {/* Wallet Connection */}
        <div style={styles.wallet}>
          {isConnected ? (
            <div style={styles.connected}>
              <span style={styles.address}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button style={styles.disconnectBtn} onClick={() => disconnect()}>
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              style={styles.connectBtn}
              onClick={() => connect({ connector: connectors[0] })}
            >
              🔐 Connect Ledger
            </button>
          )}
        </div>
      </header>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {!isConnected && (
        <div style={styles.notice}>
          Connect your Ledger to review and sign pending intents
        </div>
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
                  disabled={!isConnected}
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

      <footer style={styles.footer}>
        <p>🔐 Agents propose, humans sign with hardware.</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 20,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
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
    marginBottom: 20,
  },
  wallet: {
    marginTop: 16,
  },
  connected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  address: {
    fontFamily: 'monospace',
    background: '#1a1a1a',
    padding: '8px 12px',
    borderRadius: 8,
    color: '#4ade80',
  },
  connectBtn: {
    padding: '12px 24px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  disconnectBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #444',
    background: 'transparent',
    color: '#888',
    fontSize: 14,
    cursor: 'pointer',
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
  notice: {
    background: '#1a2a1a',
    color: '#4ade80',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
};
