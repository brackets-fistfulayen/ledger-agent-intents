import "./ledger-ad-item";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect } from "storybook/test";

const meta: Meta = {
  title: "Component/Molecule/ListItems/AdItem",
  tags: ["autodocs"],
  render: () => html`
    <div class="min-w-352">
      <ledger-ad-item title="Ledger Ad Item"></ledger-ad-item>
    </div>
  `,
  argTypes: {
    // Add argTypes as component properties are developed
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Default ad item component display.",
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
          Ad Items
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-ad-item></ledger-ad-item>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Overview of ad item variations.",
      },
    },
  },
};

export const TestInteractions: Story = {
  play: async ({ canvasElement, step }) => {
    await step("Verify component renders correctly", async () => {
      const adItem = canvasElement.querySelector("ledger-ad-item");
      expect(adItem).toBeInTheDocument();
    });

    await step("Verify content is displayed", async () => {
      const adItem = canvasElement.querySelector("ledger-ad-item");
      const content = adItem?.shadowRoot?.querySelector("div");

      expect(content).toBeInTheDocument();
      expect(content?.textContent?.trim()).toBe("Ledger Ad Item");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify ad item functionality.",
      },
    },
  },
};
