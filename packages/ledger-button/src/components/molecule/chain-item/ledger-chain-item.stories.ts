import "./ledger-chain-item";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent } from "storybook/test";

const meta: Meta = {
  title: "Component/Molecule/ListItems/Chain",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="min-w-352">
      <ledger-chain-item
        .ledgerId=${args.ledgerId}
        .title=${args.title}
        .subtitle=${args.subtitle}
        .ticker=${args.ticker}
        .value=${args.value}
        .isClickable=${args.isClickable}
        .type=${args.type}
        @chain-item-click=${(e: CustomEvent) => {
          console.log("Chain item clicked:", e.detail);
        }}
      ></ledger-chain-item>
    </div>
  `,
  argTypes: {
    ledgerId: {
      control: "text",
      description: "The Ledger ID for the cryptocurrency icon",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    title: {
      control: "text",
      description: "The chain title or name",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    subtitle: {
      control: "text",
      description: "The chain subtitle displayed under the title",
      table: {
        type: { summary: "string" },
        category: "Optional",
      },
    },
    ticker: {
      control: "text",
      description: "The chain ticker symbol",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    value: {
      control: "text",
      description: "The chain value amount",
      table: {
        type: { summary: "string" },
        category: "Required",
      },
    },
    isClickable: {
      control: "boolean",
      description: "Whether the item is clickable and renders as a button",
      table: {
        type: { summary: "boolean" },
        category: "Optional",
      },
    },
    type: {
      control: { type: "select" },
      options: ["token", "network"],
      description: "The type of item (affects icon variant and layout)",
      table: {
        type: { summary: '"token" | "network"' },
        category: "Required",
      },
    },
  },
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    subtitle: "ETH",
    ticker: "ETH",
    value: "2.5432",
    isClickable: true,
    type: "token",
  },
};

export default meta;
type Story = StoryObj;

export const EthereumToken: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    subtitle: "ETH",
    ticker: "ETH",
    value: "2.5432",
    isClickable: true,
    type: "token",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chain item displaying Ethereum token with rounded icon, title, ticker, and value.",
      },
    },
  },
};

export const BitcoinToken: Story = {
  args: {
    ledgerId: "bitcoin",
    title: "Bitcoin",
    subtitle: "BTC",
    ticker: "BTC",
    value: "0.12345",
    isClickable: true,
    type: "token",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chain item displaying Bitcoin token with rounded icon and clickable interaction.",
      },
    },
  },
};

export const PolygonNetwork: Story = {
  args: {
    ledgerId: "polygon",
    title: "Polygon",
    subtitle: "MATIC",
    ticker: "MATIC",
    value: "156.789",
    isClickable: true,
    type: "network",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chain item displaying Polygon network with square icon and title section.",
      },
    },
  },
};

export const ArbitrumNetwork: Story = {
  args: {
    ledgerId: "arbitrum",
    title: "Arbitrum",
    subtitle: "ARB",
    ticker: "ARB",
    value: "45.67",
    isClickable: true,
    type: "network",
  },
  parameters: {
    docs: {
      description: {
        story: "Chain item showing Arbitrum network with square icon variant.",
      },
    },
  },
};

export const NonClickableToken: Story = {
  args: {
    ledgerId: "cardano",
    title: "Cardano",
    subtitle: "ADA",
    ticker: "ADA",
    value: "1,234.56",
    isClickable: false,
    type: "token",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Non-clickable chain item that renders as a div with no hover effects or interaction.",
      },
    },
  },
};

export const HighValueToken: Story = {
  args: {
    ledgerId: "solana",
    title: "Solana",
    subtitle: "SOL",
    ticker: "SOL",
    value: "10,234.5678",
    isClickable: true,
    type: "token",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chain item with high value amount demonstrating number formatting.",
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
          Token Chains
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-chain-item
            ledger-id="ethereum"
            title="Ethereum"
            subtitle="ETH"
            ticker="ETH"
            value="2.5432"
            is-clickable="true"
            type="token"
          ></ledger-chain-item>
          <ledger-chain-item
            ledger-id="bitcoin"
            title="Bitcoin"
            subtitle="BTC"
            ticker="BTC"
            value="0.12345"
            is-clickable="true"
            type="token"
          ></ledger-chain-item>
          <ledger-chain-item
            ledger-id="cardano"
            title="Cardano"
            subtitle="ADA"
            ticker="ADA"
            value="1,234.56"
            is-clickable="false"
            type="token"
          ></ledger-chain-item>
        </div>
      </div>

      <div style="margin-top: 24px;">
        <h3
          style="margin-bottom: 8px; font-size: 14px; font-weight: 600; margin-top: 0;"
        >
          Network Chains
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-chain-item
            ledger-id="polygon"
            title="Polygon"
            subtitle="MATIC"
            ticker="MATIC"
            value="156.789"
            is-clickable="true"
            type="network"
          ></ledger-chain-item>
          <ledger-chain-item
            ledger-id="arbitrum"
            title="Arbitrum"
            subtitle="ARB"
            ticker="ARB"
            value="45.67"
            is-clickable="true"
            type="network"
          ></ledger-chain-item>
          <ledger-chain-item
            ledger-id="optimism"
            title="Optimism"
            subtitle="OP"
            ticker="OP"
            value="12.34"
            is-clickable="false"
            type="network"
          ></ledger-chain-item>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Overview of chain item variations showing different types, states, and configurations. Clickable items render as buttons, non-clickable items render as divs.",
      },
    },
  },
};

export const TestComponentRenders: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    ticker: "ETH",
    value: "2.5432",
    isClickable: false,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify component renders", async () => {
      const chainItem = canvasElement.querySelector("ledger-chain-item");
      expect(chainItem).toBeInTheDocument();
      expect(chainItem?.shadowRoot).toBeTruthy();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test to verify the component renders correctly.",
      },
    },
  },
};

export const TestIconVariants: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    isClickable: false,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify token type has rounded icon", async () => {
      const chainItem = canvasElement.querySelector("ledger-chain-item");
      const cryptoIcon =
        chainItem?.shadowRoot?.querySelector("ledger-crypto-icon");

      expect(cryptoIcon).toBeInTheDocument();
      expect(cryptoIcon?.getAttribute("variant")).toBe("rounded");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test to verify token type uses rounded icon variant.",
      },
    },
  },
};

export const TestNetworkIconVariant: Story = {
  args: {
    ledgerId: "polygon",
    title: "Polygon",
    isClickable: false,
    type: "network",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify network type has square icon", async () => {
      const chainItem = canvasElement.querySelector("ledger-chain-item");
      const cryptoIcon =
        chainItem?.shadowRoot?.querySelector("ledger-crypto-icon");

      expect(cryptoIcon).toBeInTheDocument();
      expect(cryptoIcon?.getAttribute("variant")).toBe("square");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test to verify network type uses square icon variant.",
      },
    },
  },
};

export const TestClickableRendering: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    isClickable: true,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step(
      "Verify renders as button when isClickable is true",
      async () => {
        const chainItem = canvasElement.querySelector("ledger-chain-item");
        const button = chainItem?.shadowRoot?.querySelector("button");
        const div = chainItem?.shadowRoot?.querySelector(
          ".dark > div.flex.min-w-full",
        );

        expect(button).toBeInTheDocument();
        expect(div).not.toBeInTheDocument();
      },
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test to verify component renders as button when isClickable is true.",
      },
    },
  },
};

export const TestNonClickableRendering: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    isClickable: false,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify renders as div when isClickable is false", async () => {
      const chainItem = canvasElement.querySelector("ledger-chain-item");
      const button = chainItem?.shadowRoot?.querySelector("button");
      const div = chainItem?.shadowRoot?.querySelector(
        "div.lb-flex.lb-min-w-full",
      );

      expect(button).not.toBeInTheDocument();
      expect(div).toBeInTheDocument();
      expect(div?.tagName.toLowerCase()).toBe("div");
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test to verify component renders as div when isClickable is false.",
      },
    },
  },
};

export const TestEventFiring: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    subtitle: "ETH",
    ticker: "ETH",
    value: "2.5432",
    isClickable: true,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step(
      "Verify chain-item-click event fires with correct data",
      async () => {
        const chainItem = canvasElement.querySelector("ledger-chain-item");
        let eventDetail: Record<string, unknown> | null = null;

        chainItem?.addEventListener("chain-item-click", (e: Event) => {
          const customEvent = e as CustomEvent;
          eventDetail = customEvent.detail as Record<string, unknown>;
        });

        const button = chainItem?.shadowRoot?.querySelector(
          "button",
        ) as HTMLButtonElement;
        await userEvent.click(button);

        expect(eventDetail).toBeTruthy();
        const detail = eventDetail as unknown as Record<string, unknown>;
        expect(detail.ledgerId).toBe("ethereum");
        expect(detail.title).toBe("Ethereum");
        expect(detail.subtitle).toBe("ETH");
        expect(detail.ticker).toBe("ETH");
        expect(detail.value).toBe("2.5432");
        expect(detail.type).toBe("token");
        expect(typeof detail.timestamp).toBe("number");
      },
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test to verify click event fires with correct event data when button is clicked.",
      },
    },
  },
};

export const TestNoEventWhenNotClickable: Story = {
  args: {
    ledgerId: "ethereum",
    title: "Ethereum",
    isClickable: false,
    type: "token",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify no event fires when isClickable is false", async () => {
      const chainItem = canvasElement.querySelector("ledger-chain-item");
      let eventFired = false;

      chainItem?.addEventListener("chain-item-click", () => {
        eventFired = true;
      });

      const div = chainItem?.shadowRoot?.querySelector(
        ".dark > div.flex.min-w-full",
      ) as HTMLDivElement;
      await userEvent.click(div);

      // Wait a bit to ensure no event fires
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(eventFired).toBe(false);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test to verify no event fires when component is not clickable.",
      },
    },
  },
};
