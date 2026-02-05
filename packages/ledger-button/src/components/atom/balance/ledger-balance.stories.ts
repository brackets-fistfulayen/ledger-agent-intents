import "./ledger-balance";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

interface LedgerBalanceAttributes {
  balance: number;
  ticker: string;
}

const meta: Meta<LedgerBalanceAttributes> = {
  title: "Component/Atom/Balance",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="flex bg-black p-24">
      <ledger-balance
        .balance=${args.balance}
        .ticker=${args.ticker || ""}
      ></ledger-balance>
    </div>
  `,
  argTypes: {
    balance: {
      control: "number",
      description: "The balance amount to display",
    },
    ticker: {
      control: "text",
      description: "The ticker/symbol to display below the balance",
    },
  },
};

export default meta;
type Story = StoryObj<LedgerBalanceAttributes>;

export const Default: Story = {
  args: {
    balance: 1234.56,
    ticker: "BTC",
  },
};

export const ZeroBalance: Story = {
  args: {
    balance: 0,
    ticker: "ETH",
  },
};

export const LargeBalance: Story = {
  args: {
    balance: 999999.99,
    ticker: "USD",
  },
};

export const SmallBalance: Story = {
  args: {
    balance: 0.00123456,
    ticker: "BTC",
  },
};

export const LongTicker: Story = {
  args: {
    balance: 42.5,
    ticker: "MATIC",
  },
};

export const WithoutTicker: Story = {
  args: {
    balance: 100,
    ticker: "",
  },
};
