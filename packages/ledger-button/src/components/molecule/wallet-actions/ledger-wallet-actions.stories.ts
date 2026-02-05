import "./ledger-wallet-actions";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { WalletTransactionFeature } from "./ledger-wallet-actions";

const meta: Meta = {
  title: "Component/Molecule/WalletActions",
  tags: ["autodocs"],
  render: (args) => html`
    <div style="max-width: 400px;">
      <ledger-wallet-actions
        .features=${args.features}
        @wallet-action-click=${(e: CustomEvent) => {
          console.log("Wallet action clicked:", e.detail);
        }}
      ></ledger-wallet-actions>
    </div>
  `,
  argTypes: {
    features: {
      control: "object",
      description: "Array of wallet transaction features to display",
      table: {
        type: {
          summary:
            'Array<"send" | "receive" | "swap" | "buy" | "earn" | "sell">',
        },
        defaultValue: { summary: "[]" },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const TwoActions: Story = {
  args: {
    features: ["send", "receive"] as WalletTransactionFeature[],
  },
  parameters: {
    docs: {
      description: {
        story: "Wallet actions with 2 items displayed in a 2-column grid.",
      },
    },
  },
};

export const ThreeActions: Story = {
  args: {
    features: ["send", "receive", "swap"] as WalletTransactionFeature[],
  },
  parameters: {
    docs: {
      description: {
        story: "Wallet actions with 3 items displayed in a 3-column grid.",
      },
    },
  },
};

export const FourActions: Story = {
  args: {
    features: ["send", "receive", "swap", "buy"] as WalletTransactionFeature[],
  },
  parameters: {
    docs: {
      description: {
        story: "Wallet actions with 4 items displayed in a 4-column grid.",
      },
    },
  },
};

export const FiveActions: Story = {
  args: {
    features: [
      "send",
      "receive",
      "swap",
      "buy",
      "earn",
    ] as WalletTransactionFeature[],
  },
  parameters: {
    docs: {
      description: {
        story: "Wallet actions with 5 items displayed in a 5-column grid.",
      },
    },
  },
};

export const SixActions: Story = {
  args: {
    features: [
      "send",
      "receive",
      "swap",
      "buy",
      "sell",
      "earn",
    ] as WalletTransactionFeature[],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Wallet actions with 6 items displayed in a 3-column grid (2 rows).",
      },
    },
  },
};

export const AllVariations: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: white;"
        >
          2 Actions (2 columns)
        </h3>
        <div style="max-width: 400px;">
          <ledger-wallet-actions
            .features=${["send", "receive"] as WalletTransactionFeature[]}
          ></ledger-wallet-actions>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: white;"
        >
          3 Actions (3 columns)
        </h3>
        <div style="max-width: 400px;">
          <ledger-wallet-actions
            .features=${["send", "receive", "swap"] as WalletTransactionFeature[]}
          ></ledger-wallet-actions>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: white;"
        >
          4 Actions (4 columns)
        </h3>
        <div style="max-width: 400px;">
          <ledger-wallet-actions
            .features=${["send", "receive", "swap", "buy"] as WalletTransactionFeature[]}
          ></ledger-wallet-actions>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: white;"
        >
          5 Actions (5 columns)
        </h3>
        <div style="max-width: 400px;">
          <ledger-wallet-actions
            .features=${["send", "receive", "swap", "buy", "earn"] as WalletTransactionFeature[]}
          ></ledger-wallet-actions>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: white;"
        >
          6 Actions (3 columns, 2 rows)
        </h3>
        <div style="max-width: 400px;">
          <ledger-wallet-actions
            .features=${["send", "receive", "swap", "buy", "sell", "earn"] as WalletTransactionFeature[]}
          ></ledger-wallet-actions>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Overview of all wallet action grid variations based on the number of features.",
      },
    },
  },
};
