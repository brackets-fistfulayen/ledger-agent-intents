import "./ledger-tabs";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import type { LedgerTabsAttributes } from "./ledger-tabs";

const meta: Meta<LedgerTabsAttributes> = {
  title: "Component/Atom/Tabs",
  tags: ["autodocs"],
  render: (args) => html`
    <ledger-tabs
      .tabs=${args.tabs || []}
      .selectedId=${args.selectedId || ""}
      @tab-change=${(e: CustomEvent) => {
        console.log("Tab changed:", e.detail);
      }}
    ></ledger-tabs>
  `,
  argTypes: {
    tabs: {
      control: "object",
      description: "Array of tab items with id and label",
    },
    selectedId: {
      control: "text",
      description: "The id of the currently selected tab",
    },
  },
};

export default meta;
type Story = StoryObj<LedgerTabsAttributes>;

export const TokensAndTransactions: Story = {
  args: {
    tabs: [
      { id: "tokens", label: "Tokens" },
      { id: "transactions", label: "Transactions" },
    ],
    selectedId: "tokens",
  },
};

export const TransactionsSelected: Story = {
  args: {
    tabs: [
      { id: "tokens", label: "Tokens" },
      { id: "transactions", label: "Transactions" },
    ],
    selectedId: "transactions",
  },
};

export const ThreeTabs: Story = {
  args: {
    tabs: [
      { id: "tokens", label: "Tokens" },
      { id: "nfts", label: "NFTs" },
      { id: "transactions", label: "Transactions" },
    ],
    selectedId: "tokens",
  },
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Two Tabs - First Selected
        </h3>
        <ledger-tabs
          .tabs=${[
            { id: "tokens", label: "Tokens" },
            { id: "transactions", label: "Transactions" },
          ]}
          selectedId="tokens"
        ></ledger-tabs>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Two Tabs - Second Selected
        </h3>
        <ledger-tabs
          .tabs=${[
            { id: "tokens", label: "Tokens" },
            { id: "transactions", label: "Transactions" },
          ]}
          selectedId="transactions"
        ></ledger-tabs>
      </div>

      <div>
        <h3
          style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Three Tabs
        </h3>
        <ledger-tabs
          .tabs=${[
            { id: "tokens", label: "Tokens" },
            { id: "nfts", label: "NFTs" },
            { id: "transactions", label: "Transactions" },
          ]}
          selectedId: "nfts"
        ></ledger-tabs>
      </div>
    </div>
  `,
};
