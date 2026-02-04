import type { Intent } from '@agent-intents/shared';

interface IntentCardProps {
  intent: Intent;
  onSign?: () => void;
  onReject?: () => void;
  signing?: boolean;
  readonly?: boolean;
}

export function IntentCard({ intent, onSign, onReject, signing, readonly }: IntentCardProps) {
  const { details, agentName, status, createdAt, memo } = {
    ...intent,
    memo: intent.details.memo,
  };

  const statusColors: Record<string, string> = {
    pending: '#ffa500',
    approved: '#4a9eff',
    signed: '#4a9eff',
    confirmed: '#4ade80',
    rejected: '#888',
    failed: '#ff6b6b',
    expired: '#888',
  };

  const statusLabels: Record<string, string> = {
    pending: '⏳ Pending',
    approved: '✓ Approved',
    signed: '📝 Signed',
    confirmed: '✅ Confirmed',
    rejected: '✗ Rejected',
    failed: '❌ Failed',
    expired: '⌛ Expired',
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base',
  };

  return (
    <div style={styles.card}>
      {/* Header: Agent + Time */}
      <div style={styles.header}>
        <span style={styles.agent}>🤖 {agentName}</span>
        <span style={styles.time}>{timeAgo(createdAt)}</span>
      </div>

      {/* Amount */}
      <div style={styles.amount}>
        {details.amount} {details.token}
      </div>

      {/* Recipient */}
      <div style={styles.row}>
        <span style={styles.label}>To</span>
        <span style={styles.address}>
          {details.recipientEns || `${details.recipient.slice(0, 8)}...${details.recipient.slice(-6)}`}
        </span>
      </div>

      {/* Chain */}
      <div style={styles.row}>
        <span style={styles.label}>Network</span>
        <span style={styles.value}>{chainNames[details.chainId] || `Chain ${details.chainId}`}</span>
      </div>

      {/* Memo/Reason */}
      {memo && (
        <div style={styles.memo}>
          "{memo}"
        </div>
      )}

      {/* Status or Actions */}
      {readonly ? (
        <div style={{ ...styles.status, color: statusColors[status] }}>
          {statusLabels[status]}
          {intent.txUrl && (
            <a 
              href={intent.txUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.txLink}
            >
              View tx ↗
            </a>
          )}
        </div>
      ) : (
        <div style={styles.actions}>
          <button 
            style={styles.rejectBtn}
            onClick={onReject}
            disabled={signing}
          >
            Reject
          </button>
          <button 
            style={styles.signBtn}
            onClick={onSign}
            disabled={signing}
          >
            {signing ? 'Signing...' : 'Sign with Ledger'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    border: '1px solid #333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  agent: {
    fontSize: 14,
    color: '#888',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
  },
  label: {
    color: '#666',
  },
  value: {
    color: '#fff',
  },
  address: {
    fontFamily: 'monospace',
    color: '#4a9eff',
  },
  memo: {
    background: '#252525',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    fontStyle: 'italic',
    color: '#aaa',
    fontSize: 14,
  },
  status: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    alignItems: 'center',
  },
  txLink: {
    color: '#4a9eff',
    textDecoration: 'none',
    fontSize: 12,
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
  },
  rejectBtn: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: 12,
    border: '1px solid #444',
    background: 'transparent',
    color: '#888',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  signBtn: {
    flex: 2,
    padding: '14px 20px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
