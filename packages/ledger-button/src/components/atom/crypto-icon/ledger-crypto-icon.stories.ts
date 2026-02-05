import "./ledger-crypto-icon";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { LedgerCryptoIconAttributes } from "./ledger-crypto-icon";

const meta: Meta<LedgerCryptoIconAttributes> = {
  title: "Component/Atom/CryptoIcon",
  tags: ["autodocs"],
  render: (args) => html`
    <ledger-crypto-icon
      .ledgerId=${args.ledgerId || ""}
      .size=${args.size || "large"}
      .variant=${args.variant || "rounded"}
    ></ledger-crypto-icon>
  `,
  argTypes: {
    ledgerId: {
      control: "text",
      description:
        "The Ledger ID of the cryptocurrency (e.g., 'bitcoin', 'ethereum', 'cardano')",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
      description: "The size of the crypto icon",
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: '"large"' },
      },
    },
    variant: {
      control: { type: "select" },
      options: ["rounded", "square"],
      description: "The shape variant of the crypto icon",
      table: {
        type: { summary: '"rounded" | "square"' },
        defaultValue: { summary: '"rounded"' },
      },
    },
  },
  args: {
    ledgerId: "bitcoin",
    size: "large",
    variant: "rounded",
  },
};

export default meta;
type Story = StoryObj<LedgerCryptoIconAttributes>;

export const Bitcoin: Story = {
  args: {
    ledgerId: "bitcoin",
    size: "large",
    variant: "rounded",
  },
  parameters: {
    docs: {
      description: {
        story: "Bitcoin cryptocurrency icon using the ledgerId 'bitcoin'.",
      },
    },
  },
};

export const Ethereum: Story = {
  args: {
    ledgerId: "ethereum",
    size: "large",
  },
  parameters: {
    docs: {
      description: {
        story: "Ethereum cryptocurrency icon using the ledgerId 'ethereum'.",
      },
    },
  },
};

export const Cardano: Story = {
  args: {
    ledgerId: "cardano",
    size: "medium",
  },
  parameters: {
    docs: {
      description: {
        story: "Cardano cryptocurrency icon using the ledgerId 'cardano'.",
      },
    },
  },
};

export const Solana: Story = {
  args: {
    ledgerId: "solana",
    size: "medium",
    variant: "rounded",
  },
  parameters: {
    docs: {
      description: {
        story: "Solana cryptocurrency icon using the ledgerId 'solana'.",
      },
    },
  },
};

export const SquareVariant: Story = {
  args: {
    ledgerId: "ethereum",
    size: "large",
    variant: "square",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ethereum cryptocurrency icon using the square variant with rounded corners.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 24px;">
      <div style="text-align: center;">
        <ledger-crypto-icon
          ledger-id="bitcoin"
          size="large"
          variant="rounded"
        ></ledger-crypto-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Rounded (Circle)
        </p>
      </div>
      <div style="text-align: center;">
        <ledger-crypto-icon
          ledger-id="bitcoin"
          size="large"
          variant="square"
        ></ledger-crypto-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Square (Rounded Corners)
        </p>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Comparison of rounded (circular) and square (rounded corners) variants.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 24px;">
      <div style="text-align: center;">
        <ledger-crypto-icon
          ledger-id="bitcoin"
          size="small"
        ></ledger-crypto-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Small (80px)
        </p>
      </div>
      <div style="text-align: center;">
        <ledger-crypto-icon
          ledger-id="bitcoin"
          size="medium"
        ></ledger-crypto-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Medium (96px)
        </p>
      </div>
      <div style="text-align: center;">
        <ledger-crypto-icon
          ledger-id="bitcoin"
          size="large"
        ></ledger-crypto-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
          Large (128px)
        </p>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "All available sizes for crypto icons: small (20px), medium (32px), large (48px).",
      },
    },
  },
};
