import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// For hackathon: using injected connector which works with Ledger Extension
// In production: add @ledgerhq/ledger-wagmi-connector for full Ledger Connect Kit
export const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected({
      target: 'metaMask', // Also works with Ledger Extension
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
