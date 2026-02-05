import "./ledger-platform-item.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent, waitFor } from "storybook/test";

const meta: Meta = {
  title: "Component/Molecule/ListItems/Platform",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="min-w-352">
      <ledger-platform-item
        .title=${args.title || ""}
        .hint=${args.hint || ""}
        .platformType=${args.platformType || ""}
        .clickable=${args.clickable ?? true}
        .disabled=${args.disabled ?? false}
        @platform-item-click=${(e: CustomEvent) => {
          console.log("Platform item clicked:", e.detail);
        }}
      ></ledger-platform-item>
    </div>
  `,
  argTypes: {
    title: {
      control: "text",
      description: "The main title text ",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    hint: {
      control: "text",
      description: "The hint text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    platformType: {
      control: { type: "select" },
      options: ["", "mobile", "desktop"],
      description:
        "The platform type (mobile or desktop) to display on the left side of the button",
      table: {
        type: { summary: '"mobile" | "desktop"' },
        defaultValue: { summary: '""' },
      },
    },
    clickable: {
      control: "boolean",
      description: "Whether the item is clickable",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the item is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Bluetooth: Story = {
  args: {
    title: "Mobile Platform",
    hint: "Switch On Device and unlock for connecting with Mobile",
    platformType: "mobile",
  },
  parameters: {
    docs: {
      description: {
        story: "Platform item with Mobile icon and title.",
      },
    },
  },
};

export const USB: Story = {
  args: {
    title: "Desktop Platform",
    hint: "Plug in device and unlock for connecting with Desktop",
    platformType: "desktop",
  },
  parameters: {
    docs: {
      description: {
        story: "Platform item with Desktop icon and title.",
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
          Basic Items
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-platform-item
            title="Mobile Platform"
            platform-type="mobile"
          ></ledger-platform-item>
          <ledger-platform-item
            title="Desktop Platform"
            platform-type="desktop"
          ></ledger-platform-item>
          <ledger-platform-item title="Only Title"></ledger-platform-item>
          <ledger-platform-item platform-type="mobile"></ledger-platform-item>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 8px; font-size: 14px; font-weight: 600;">
          States
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-platform-item
            title="Disabled Item"
            platform-type="mobile"
            disabled
          ></ledger-platform-item>
          <ledger-platform-item
            title="Non-clickable Item"
            platform-type="desktop"
            .clickable=${false}
          ></ledger-platform-item>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Overview of platform item variations and states with mobile and desktop platform types.",
      },
    },
  },
};

export const TestInteractions: Story = {
  args: {
    title: "Test Mobile Platform",
    platformType: "mobile",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify component renders correctly", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      expect(platformItem).toBeInTheDocument();

      const button = platformItem?.shadowRoot?.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    await step("Verify title is displayed", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      const button = platformItem?.shadowRoot?.querySelector("button");
      const span = button?.querySelector("span");

      expect(span).toBeInTheDocument();
      expect(span?.textContent?.trim()).toBe("Test Mobile Platform");
    });

    await step("Verify icon is present", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      const button = platformItem?.shadowRoot?.querySelector("button");
      const icon = button?.querySelector("ledger-icon[type='mobile']");

      expect(icon).toBeInTheDocument();
    });

    await step("Verify chevron is present", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      const button = platformItem?.shadowRoot?.querySelector("button");
      const chevron = button?.querySelector("ledger-icon[type='chevronRight']");

      expect(chevron).toBeInTheDocument();
    });

    await step("Verify click functionality", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      let clickEventFired = false;

      platformItem?.addEventListener(
        "ledger-platform-item-click",
        (e: Event) => {
          const customEvent = e as CustomEvent;
          clickEventFired = true;
          expect(customEvent.detail.platformType).toBe("mobile");
        },
      );

      const button = platformItem?.shadowRoot?.querySelector("button");
      if (button) {
        await userEvent.click(button);
        await waitFor(() => {
          expect(clickEventFired).toBe(true);
        });
      }
    });

    await step("Verify keyboard navigation", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      let keyboardEventFired = false;

      platformItem?.addEventListener("ledger-platform-item-click", () => {
        keyboardEventFired = true;
      });

      const button = platformItem?.shadowRoot?.querySelector("button");
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
        story: "Automated test story to verify component functionality.",
      },
    },
  },
};

export const TestDisabledState: Story = {
  args: {
    title: "Disabled Item",
    connectionType: "bluetooth",
    disabled: true,
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify disabled styling", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      const button = platformItem?.shadowRoot?.querySelector("button");

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("disabled");
    });

    await step("Verify no click events when disabled", async () => {
      const platformItem = canvasElement.querySelector("ledger-platform-item");
      let clickEventFired = false;

      platformItem?.addEventListener("connection-item-click", () => {
        clickEventFired = true;
      });

      const button = platformItem?.shadowRoot?.querySelector("button");
      if (button) {
        // For disabled elements, simulate the click directly instead of using userEvent
        // since disabled elements with pointer-events: none can't be clicked through userEvent
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(clickEventFired).toBe(false);
      }
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test story to verify disabled state functionality.",
      },
    },
  },
};
