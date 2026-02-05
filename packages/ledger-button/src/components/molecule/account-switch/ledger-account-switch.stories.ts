import "./ledger-account-switch";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Component/Molecule/AccountSwitch",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="min-w-96 bg-black p-24">
      <ledger-account-switch .account=${args.account}></ledger-account-switch>
    </div>
  `,
  argTypes: {
    account: {
      control: "object",
      description: "The account object containing account details",
      table: {
        type: { summary: "object" },
        category: "Required",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    account: {
      id: "account-1",
      currencyId: "ethereum",
      freshAddress: "0x1234567890abcdef1234567890abcdef12345678",
      seedIdentifier: "seed-1",
      derivationMode: "ethM",
      index: 0,
      name: "pinkman.eth",
    },
  },
};

export const BitcoinAccount: Story = {
  args: {
    account: {
      id: "account-2",
      currencyId: "bitcoin",
      freshAddress: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
      seedIdentifier: "seed-1",
      derivationMode: "legacy",
      index: 1,
      name: "bitcoin 1",
    },
  },
};

export const LongAccountName: Story = {
  args: {
    account: {
      id: "account-3",
      currencyId: "polygon",
      freshAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      seedIdentifier: "seed-2",
      derivationMode: "ethM",
      index: 2,
      name: "My Very Long Account Name That Might Overflow",
    },
  },
};

export const WithoutAccount: Story = {
  args: {
    account: undefined,
  },
};

export const MultipleAccounts: Story = {
  render: () => html`
    <div class="flex min-w-96 flex-col gap-2 bg-black p-24">
      <ledger-account-switch
        .account=${{
          id: "account-1",
          currencyId: "ethereum",
          freshAddress: "0x1234567890abcdef1234567890abcdef12345678",
          seedIdentifier: "seed-1",
          derivationMode: "ethM",
          index: 0,
          name: "My Main Account",
        }}
      ></ledger-account-switch>
      <ledger-account-switch
        .account=${{
          id: "account-2",
          currencyId: "bitcoin",
          freshAddress: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
          seedIdentifier: "seed-1",
          derivationMode: "legacy",
          index: 1,
          name: "Bitcoin Wallet",
        }}
      ></ledger-account-switch>
      <ledger-account-switch
        .account=${{
          id: "account-3",
          currencyId: "polygon",
          freshAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
          seedIdentifier: "seed-2",
          derivationMode: "ethM",
          index: 2,
          name: "Polygon Account",
        }}
      ></ledger-account-switch>
    </div>
  `,
};
