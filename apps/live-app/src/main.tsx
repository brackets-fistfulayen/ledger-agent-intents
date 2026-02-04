import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletAPIProvider } from '@ledgerhq/wallet-api-client-react';
import App from './App';

// Get window.walletApi transport from Ledger Live
const getWalletAPITransport = () => {
  if (typeof window !== 'undefined' && 'walletApi' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).walletApi;
  }
  return undefined;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAPIProvider transport={getWalletAPITransport()}>
      <App />
    </WalletAPIProvider>
  </React.StrictMode>
);
