import "./sign-transaction";
import "../../context/core-context.js";
import "../../context/language-context.js";
import "../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/SignTransaction/SignTransactionScreen",
  render: (args) => html`
    <core-provider>
      <language-provider>
        <ledger-modal-story-wrapper>
          <sign-transaction-screen
            .state=${args.state}
            .deviceModel=${args.deviceModel}
            .transactionId=${args.transactionId}
            .transactionParams=${args.transactionParams}
          ></sign-transaction-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["signing", "success", "error"],
    },
    transactionId: {
      control: { type: "text" },
    },
    transactionParams: {
      control: { type: "object" },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Signing: Story = {
  args: {
    state: "signing",
    deviceModel: "stax",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0xf86c8085174876e800825208944bbeeb066ed09b7aed07bf39eee0460dfa261520880de0b6b3a7640000802aa0a7def7a0b8c8c8b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
      derivationPath: "44'/60'/0'/0/0",
    },
  },
};

export const SigningNanoX: Story = {
  args: {
    state: "signing",
    deviceModel: "nanox",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0xf86e8085174876e800825208944bbeeb066ed09b7aed07bf39eee0460dfa26152088016345785d8a0000802aa0b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a02d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    },
  },
};

export const SigningFlex: Story = {
  args: {
    state: "signing",
    deviceModel: "flex",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0xf86d8085174876e800825208948da5cb82b122cb4e10be751d45b3b6f5e4a7d91588038d7ea4c68000802aa0c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a03e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
    },
  },
};

export const Success: Story = {
  args: {
    state: "success",
    deviceModel: "stax",
    transactionId: "0x1234567890abcdef1234567890abcdef12345678",
    transactionParams: {
      rawTransaction:
        "0xf86c8085174876e800825208944bbeeb066ed09b7aed07bf39eee0460dfa261520880de0b6b3a7640000802aa0a7def7a0b8c8c8b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    },
  },
};

export const Error: Story = {
  args: {
    state: "error",
    deviceModel: "stax",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0xf86c8085174876e800825208944bbeeb066ed09b7aed07bf39eee0460dfa261520880de0b6b3a7640000802aa0a7def7a0b8c8c8b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a01a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    },
  },
};

// ERC20 transfer transaction
export const ERC20Transfer: Story = {
  args: {
    state: "signing",
    deviceModel: "stax",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0xf8a98085174876e80082fde894a0b86a33e6815e2d5e7b4a00ad4bd5085e0a4d9e80b844a9059cbb000000000000000000000000742d35cc6634c0532925a3b8d35d423b2e5ac4a80000000000000000000000000000000000000000000000000de0b6b3a7640000802aa0e8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a04f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
    },
  },
};

// EIP-1559 transaction with maxFeePerGas and maxPriorityFeePerGas
export const EIP1559Transaction: Story = {
  args: {
    state: "signing",
    deviceModel: "flex",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0x02f8708001808459682f0085174876e800825208944bbeeb066ed09b7aed07bf39eee0460dfa261520880de0b6b3a764000080c001a0f8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a05a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    },
  },
};

// Polygon transaction (different chain ID)
export const PolygonTransaction: Story = {
  args: {
    state: "signing",
    deviceModel: "nanox",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0x02f871818901808459682f0085174876e80082c350948f3cf7ad23cd3cadbdfebf95f44f9bc3829c1ecd80b844a9059cbb000000000000000000000000742d35cc6634c0532925a3b8d35d423b2e5ac4a80000000000000000000000000000000000000000000000000de0b6b3a7640000c001a0a8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a06b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
      derivationPath: "44'/60'/0'/0/0", // Same path for Polygon
    },
  },
};

// Contract interaction with complex data
export const ContractInteraction: Story = {
  args: {
    state: "signing",
    deviceModel: "flex",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0x02f8d18001808459682f00851766cd800083019a28941f9840a85d5af5bf1d1762f925bdaddc4201f98480b864095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc001a0b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a07c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    },
  },
};

// High priority transaction with custom derivation path
export const HighPriorityTransaction: Story = {
  args: {
    state: "signing",
    deviceModel: "flex",
    transactionId: "",
    transactionParams: {
      rawTransaction:
        "0x02f8708001808502540be400851ca7b320008252089442be7636ecfeb93a7a99b58d0728a9c5abed7a3608806f05b59d3b2000080c001a0c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8a08d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
      derivationPath: "44'/60'/0'/0/1", // Different account index
    },
  },
};
