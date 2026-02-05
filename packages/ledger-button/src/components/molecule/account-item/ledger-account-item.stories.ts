import "./ledger-account-item";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent, waitFor } from "storybook/test";

const meta: Meta = {
  title: "Component/Molecule/ListItems/Account",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="min-w-352">
      <ledger-account-item
        .title=${args.title}
        .address=${args.address}
        .ticker=${args.ticker}
        .ledgerId=${args.ledgerId}
        .balance=${args.balance}
        .linkLabel=${args.linkLabel}
        @account-item-click=${(e: CustomEvent) => {
          console.log("Account item clicked:", e.detail);
        }}
      ></ledger-account-item>
    </div>
  `,
  argTypes: {
    title: {
      control: "text",
      description: "The account title or name.",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    address: {
      control: "text",
      description: "The wallet address",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    ticker: {
      control: "text",
      description: "The token ticker symbol",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    ledgerId: {
      control: "text",
      description: "The Ledger ID for the cryptocurrency icon",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    value: {
      control: "text",
      description: "The account formatted balance",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    linkLabel: {
      control: "text",
      description: "Additional link label text",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
  },
  args: {
    title: "My Ethereum Account",
    address: "0x1234...5678",
    ticker: "ETH",
    ledgerId: "ethereum",
    balance: "2.5432",
    linkLabel: "Show tokens",
  },
};

export default meta;
type Story = StoryObj;

export const EthereumAccount: Story = {
  args: {
    title: "My Ethereum Account",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    ticker: "ETH",
    ledgerId: "ethereum",
    balance: "2.5432",
    linkLabel: "Show tokens",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Account item displaying an Ethereum account with balance and link.",
      },
    },
  },
};

export const BitcoinAccount: Story = {
  args: {
    title: "Bitcoin Wallet",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ticker: "BTC",
    ledgerId: "bitcoin",
    balance: "0.12345",
    linkLabel: "Show tokens",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Account item displaying a Bitcoin account with balance and link.",
      },
    },
  },
};

export const PolygonAccount: Story = {
  args: {
    title: "Polygon Account",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    ticker: "MATIC",
    ledgerId: "polygon",
    balance: "156.789",
    linkLabel: "Show tokens",
  },
  parameters: {
    docs: {
      description: {
        story: "Account item displaying a Polygon account with MATIC balance.",
      },
    },
  },
};

export const HighValueAccount: Story = {
  args: {
    title: "Main Trading Account",
    address: "0x9876543210fedcba9876543210fedcba98765432",
    ticker: "ETH",
    ledgerId: "ethereum",
    balance: "1234.5678",
    linkLabel: "Show tokens",
    hasTokens: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Account item with a high value balance demonstrating number formatting.",
      },
    },
  },
};

export const NoLinkLabel: Story = {
  args: {
    title: "Simple Account",
    address: "0x1111222233334444555566667777888899990000",
    ticker: "ETH",
    ledgerId: "ethereum",
    balance: "0.001",
    linkLabel: "",
    hasTokens: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Account item without a link label, showing minimal information.",
      },
    },
  },
};

export const AlgorandTokenAccount: Story = {
  args: {
    title: "Algorand Token Account",
    address: "ALGORAND1234567890ABCDEF1234567890ABCDEF123456",
    ticker: "USDC",
    ledgerId: "algorand/asa/312769",
    balance: "150.25",
    linkLabel: "View on explorer",
    hasTokens: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Account item showing a complex ledgerId format for Algorand ASA tokens.",
      },
    },
  },
};

export const AllVariations: Story = {
  render: () => html`
    <div>
      <div>
        <h3
          style="margin-bottom: 8px; font-size: 14px; font-weight: 600; margin-top: 0;"
        >
          Account Types
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-account-item
            title="My Ethereum Account"
            address="0x1234567890abcdef1234567890abcdef12345678"
            ticker="ETH"
            ledger-id="ethereum"
            balance="2.5432"
            link-label="Show tokens"
          ></ledger-account-item>
          <ledger-account-item
            title="Bitcoin Wallet"
            address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
            ticker="BTC"
            ledger-id="bitcoin"
            balance="0.12345"
            link-label="Show tokens"
          ></ledger-account-item>
          <ledger-account-item
            title="Polygon Account"
            address="0xabcdef1234567890abcdef1234567890abcdef12"
            ticker="MATIC"
            ledger-id="polygon"
            balance="156.789"
            link-label="Show tokens"
          ></ledger-account-item>
          <ledger-account-item
            title="Simple Account"
            address="0x1111222233334444555566667777888899990000"
            ticker="ETH"
            ledger-id="ethereum"
            balance="0.001"
            link-label=""
          ></ledger-account-item>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Overview of account item variations showing different account types.",
      },
    },
  },
};

export const TestInteractions: Story = {
  args: {
    title: "Test Account",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    ticker: "ETH",
    ledgerId: "ethereum",
    balance: "1.234",
    linkLabel: "Show tokens",
    hasTokens: true,
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify component renders correctly", async () => {
      const accountItem = canvasElement.querySelector("ledger-account-item");
      expect(accountItem).toBeInTheDocument();

      const button = accountItem?.shadowRoot?.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    await step("Verify account information is displayed", async () => {
      const accountItem = canvasElement.querySelector("ledger-account-item");
      const button = accountItem?.shadowRoot?.querySelector("button");

      const titleElement = button?.querySelector("span");
      expect(titleElement).toBeInTheDocument();
      expect(titleElement?.textContent?.trim()).toBe("Test Account");
    });

    await step("Verify click functionality", async () => {
      const accountItem = canvasElement.querySelector("ledger-account-item");
      let clickEventFired = false;

      accountItem?.addEventListener("account-item-click", (e: Event) => {
        const customEvent = e as CustomEvent;
        clickEventFired = true;
        expect(customEvent.detail.title).toBe("Test Account");
        expect(customEvent.detail.address).toBe(
          "0x1234567890abcdef1234567890abcdef12345678",
        );
        expect(customEvent.detail.ticker).toBe("ETH");
        expect(customEvent.detail.ledgerId).toBe("ethereum");
        expect(customEvent.detail.balance).toBe("1.234");
        expect(customEvent.detail.linkLabel).toBe("Show tokens");
      });

      const button = accountItem?.shadowRoot?.querySelector("button");
      if (button) {
        await userEvent.click(button);
        await waitFor(() => {
          expect(clickEventFired).toBe(true);
        });
      }
    });

    await step("Verify keyboard navigation", async () => {
      const accountItem = canvasElement.querySelector("ledger-account-item");
      let keyboardEventFired = false;

      accountItem?.addEventListener("account-item-click", () => {
        keyboardEventFired = true;
      });

      const button = accountItem?.shadowRoot?.querySelector("button");
      if (button) {
        button.focus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => {
          expect(keyboardEventFired).toBe(true);
        });
      }
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify account item functionality.",
      },
    },
  },
};
