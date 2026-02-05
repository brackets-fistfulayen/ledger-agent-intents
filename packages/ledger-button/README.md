# @ledgerhq/ledger-wallet-provider

A comprehensive Web Components-based library that provides a complete Ledger hardware wallet integration solution for web applications. Built with Lit and designed to work with any frontend framework.

## Features

- **EIP-1193 Provider**: Complete Ethereum Provider implementation with full JSON-RPC support
- **EIP-6963 Support**: Multi-wallet discovery and selection
- **Framework Agnostic**: Works with any frontend framework (React, Vue, Angular, Svelte, etc.)
- **Hardware Wallet Integration**: Direct connection to Ledger devices via USB and Bluetooth
- **Modern UI**: Pre-built components with Tailwind CSS styling and dark mode support
- **Transaction Signing**: Support for Ethereum transactions, typed data, and personal messages
- **Account Management**: Multi-account support and switching
- **Ledger Sync Integration**: Seamless integration with Ledger's cloud services
- **Device Management**: Support for multiple device types and connection methods

## Installation

```bash
npm install @ledgerhq/ledger-wallet-provider
```

## Quick Start

### Basic Setup

```javascript
import { initializeLedgerProvider } from '@ledgerhq/ledger-wallet-provider';
import '@ledgerhq/ledger-wallet-provider/styles.css';

// Initialize the Ledger provider
const cleanup = initializeLedgerProvider({
  devConfig: {
    stub: {
      base: false,              // Enable base stub mode for development
      account: false,           // Enable account stubbing
      device: false,            // Enable device stubbing
      web3Provider: false,      // Enable Web3 provider stubbing
      dAppConfig: false,        // Enable dApp config stubbing
    },
  },
  target: document.body,        // Optional: specify where to mount the UI
  dAppIdentifier: 'my-dapp',   // Your dApp identifier
  apiKey: 'your-api-key',      // Your Ledger API key
  loggerLevel: 'info',         // Log level: 'debug', 'info', 'warn', 'error'
  dmkConfig: undefined,        // Device Management Kit configuration (optional)
});

// Request provider discovery
window.dispatchEvent(new Event('eip6963:requestProvider'));
```

### React Integration

```tsx
import { useEffect, useState, useCallback } from 'react';
import type { EIP6963ProviderDetail } from '@ledgerhq/ledger-wallet-provider';

function useProviders() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EIP6963ProviderDetail | null>(null);

  const handleAnnounceProvider = useCallback((e: CustomEvent<EIP6963ProviderDetail>) => {
    setProviders(prev => {
      const found = prev.find(p => p.info.uuid === e.detail.info.uuid);
      if (found) return prev;
      return [...prev, e.detail];
    });
  }, []);

  useEffect(() => {
    // Dynamic import is required because the library uses browser APIs
    // and won't work with Server-Side Rendering (SSR)
    const initializeProvider = async () => {
      const { initializeLedgerProvider } = await import('@ledgerhq/ledger-wallet-provider');
      
      const cleanup = initializeLedgerProvider({
        devConfig: {
          stub: {
            base: false,              // Set to true for development
            account: false,           // Enable account stubbing
            device: false,            // Enable device stubbing
            web3Provider: false,      // Enable Web3 provider stubbing
            dAppConfig: false,        // Enable dApp config stubbing
          },
        },
        dAppIdentifier: 'my-dapp',
        apiKey: 'your-api-key',
        loggerLevel: 'info',         // Log level configuration
        dmkConfig: undefined,       // Device Management Kit config (optional)
      });

      window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
      
      return cleanup;
    };

    let cleanup: (() => void) | undefined;
    
    initializeProvider().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    return () => {
      cleanup?.();
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
    };
  }, [handleAnnounceProvider]);

  return { providers, selectedProvider, setSelectedProvider };
}

function App() {
  const { providers, selectedProvider, setSelectedProvider } = useProviders();
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!selectedProvider) return;
    
    try {
      const accounts = await selectedProvider.provider.request({
        method: 'eth_requestAccounts',
        params: []
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const signTransaction = async (transaction: any) => {
    if (!selectedProvider) return;
    
    try {
      const result = await selectedProvider.provider.request({
        method: 'eth_signTransaction',
        params: [transaction]
      });
      return result;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
    }
  };

  return (
    <div>
      {providers.map(provider => (
        <button 
          key={provider.info.uuid}
          onClick={() => setSelectedProvider(provider)}
        >
          Connect {provider.info.name}
        </button>
      ))}
      
      {selectedProvider && (
        <button onClick={connectWallet}>
          Request Accounts
        </button>
      )}
      
      {account && <p>Connected: {account}</p>}
    </div>
  );
}
```

## API Reference

### `initializeLedgerProvider(options)`

Initializes the Ledger Wallet Provider and injects the UI components into the DOM.

#### Parameters

```typescript
{
  devConfig?: {
    stub?: {
      base?: boolean;            // Enable base stub mode for development (default: false)
      account?: boolean;         // Enable account stubbing (default: false)
      device?: boolean;          // Enable device stubbing (default: false)
      web3Provider?: boolean;    // Enable Web3 provider stubbing (default: false)
      dAppConfig?: boolean;      // Enable dApp config stubbing (default: false)
    };
  };
  target?: HTMLElement;        // Target element to mount UI (default: document.body)
  dAppIdentifier?: string;     // Your dApp identifier
  apiKey?: string;             // Your Ledger API key
  loggerLevel?: string;        // Log level: 'debug', 'info', 'warn', 'error' (default: 'info')
  dmkConfig?: any;             // Device Management Kit configuration (optional)
}
```

#### Returns

A cleanup function to remove the provider and UI components.

### `LedgerEIP1193Provider`

The main provider class that implements the EIP-1193 standard.

#### Methods

- `request({ method, params })` - Make JSON-RPC requests
- `on(event, listener)` - Listen to provider events
- `removeListener(event, listener)` - Remove event listeners
- `isConnected()` - Check connection status
- `disconnect()` - Disconnect from the provider

#### Supported Methods

- `eth_requestAccounts` - Request user accounts
- `eth_accounts` - Get current accounts
- `eth_chainId` - Get current chain ID
- `eth_sendTransaction` - Send and sign transactions
- `eth_signTransaction` - Sign transactions
- `eth_signRawTransaction` - Sign raw transactions
- `eth_sign` - Sign messages
- `personal_sign` - Sign personal messages
- `eth_sendRawTransaction` - Send raw transactions
- `eth_signTypedData` - Sign typed data (EIP-712)
- `eth_signTypedData_v4` - Sign typed data v4 (EIP-712)
- `eth_getBalance` - Get account balance (delegated to core)

#### Events

- `accountsChanged` - Fired when accounts change
- `chainChanged` - Fired when chain changes
- `connect` - Fired when provider connects
- `disconnect` - Fired when provider disconnects

## Server-Side Rendering (SSR) Compatibility

The library uses browser-specific APIs and requires dynamic imports in SSR environments:

```javascript
// ❌ Don't do this in SSR environments
import { initializeLedgerProvider } from '@ledgerhq/ledger-wallet-provider';

// ✅ Use dynamic imports instead
useEffect(() => {
  const initializeProvider = async () => {
    const { initializeLedgerProvider } = await import('@ledgerhq/ledger-wallet-provider');
    return initializeLedgerProvider({ /* options */ });
  };
  
  initializeProvider();
}, []);
```

**Why dynamic imports are necessary:**
- The library uses Web APIs (`window`, `document`, `CustomEvent`) that don't exist in Node.js
- Direct imports will cause build errors in SSR frameworks (Next.js, Nuxt, SvelteKit, etc.)
- Dynamic imports ensure the code only runs in the browser environment

## Styling

Import the CSS file to get the default styling:

```javascript
import '@ledgerhq/ledger-wallet-provider/styles.css';
```

## Development Mode

For development and testing, you can enable stub mode:

```javascript
const cleanup = initializeLedgerProvider({
  devConfig: {
    stub: {
      base: true,              // Enable base stub mode
      account: true,           // Mock account operations
      device: true,            // Mock device interactions
      web3Provider: true,      // Mock Web3 provider responses
      dAppConfig: true,        // Mock dApp configuration
    },
  },
  dAppIdentifier: 'my-dapp',
  apiKey: 'your-api-key',
});
```

## Requirements

- ES2020+ support
- Modern bundler (Vite, Webpack 5+, etc.)
- Browser environment (no Node.js server-side execution)
- Web HID API support (for USB connections)
- Web Bluetooth API support (for Bluetooth connections)
- **Note**: Mobile browsers are not supported due to Web HID/BLE API not being implemented

## Browser Support

- **Desktop**: Chrome 89+, Firefox 89+, Safari 14.1+, Edge 89+
- **Mobile**: Not supported (Web HID/BLE APIs not available)
- **Web Extensions**: Supported in manifest v3 extensions

## Building

Run `nx build ledger-wallet-provider` to build the library.

## Testing

Run `nx test ledger-wallet-provider` to execute the unit tests via [Vitest](https://vitest.dev/).

## Storybook

Run `nx storybook ledger-wallet-provider` to start the Storybook development server for component development and testing.

## Version

Current version: **1.0.0-rc.5**

This is a release candidate version. The API is stable but may have minor changes before the final 1.0.0 release.

## License

This project is licensed under the MIT License.
