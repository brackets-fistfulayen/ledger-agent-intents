import "./ledger-connection-item";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent, waitFor } from "storybook/test";

const meta: Meta = {
  title: "Component/Molecule/ListItems/Connection",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="min-w-352">
      <ledger-connection-item
        .title=${args.title || ""}
        .hint=${args.hint || ""}
        .connectionType=${args.connectionType || ""}
        .clickable=${args.clickable ?? true}
        .disabled=${args.disabled ?? false}
        @connection-item-click=${(e: CustomEvent) => {
          console.log("Connection item clicked:", e.detail);
        }}
      ></ledger-connection-item>
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
    connectionType: {
      control: { type: "select" },
      options: ["", "bluetooth", "usb"],
      description:
        "The connection type (bluetooth or usb) to display on the left side of the button",
      table: {
        type: { summary: '"bluetooth" | "usb"' },
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
    title: "Bluetooth Connection",
    hint: "Switch On Device and unlock for connecting with Bluetooth",
    connectionType: "bluetooth",
  },
  parameters: {
    docs: {
      description: {
        story: "Connection item with Bluetooth icon and title.",
      },
    },
  },
};

export const USB: Story = {
  args: {
    title: "USB Connection",
    hint: "Plug in device and unlock for connecting with USB",
    connectionType: "usb",
  },
  parameters: {
    docs: {
      description: {
        story: "Connection item with USB icon and title.",
      },
    },
  },
};

export const OnlyTitle: Story = {
  args: {
    title: "Simple Button",
  },
  parameters: {
    docs: {
      description: {
        story: "Connection item with only title text, no icon.",
      },
    },
  },
};

export const OnlyIcon: Story = {
  args: {
    connectionType: "bluetooth",
  },
  parameters: {
    docs: {
      description: {
        story: "Connection item with only icon, no title text.",
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
          <ledger-connection-item
            title="Bluetooth Connection"
            connection-type="bluetooth"
          ></ledger-connection-item>
          <ledger-connection-item
            title="USB Connection"
            connection-type="usb"
          ></ledger-connection-item>
          <ledger-connection-item title="Only Title"></ledger-connection-item>
          <ledger-connection-item
            connection-type="bluetooth"
          ></ledger-connection-item>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 8px; font-size: 14px; font-weight: 600;">
          States
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <ledger-connection-item
            title="Disabled Item"
            connection-type="bluetooth"
            disabled
          ></ledger-connection-item>
          <ledger-connection-item
            title="Non-clickable Item"
            connection-type="usb"
            .clickable=${false}
          ></ledger-connection-item>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Overview of connection item variations and states with bluetooth and usb connection types.",
      },
    },
  },
};

export const TestInteractions: Story = {
  args: {
    title: "Test Button",
    connectionType: "bluetooth",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify component renders correctly", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      expect(connectionItem).toBeInTheDocument();

      const button = connectionItem?.shadowRoot?.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    await step("Verify title is displayed", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      const button = connectionItem?.shadowRoot?.querySelector("button");
      const span = button?.querySelector("span");

      expect(span).toBeInTheDocument();
      expect(span?.textContent?.trim()).toBe("Test Button");
    });

    await step("Verify icon is present", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      const button = connectionItem?.shadowRoot?.querySelector("button");
      const icon = button?.querySelector("ledger-icon[type='bluetooth']");

      expect(icon).toBeInTheDocument();
    });

    await step("Verify chevron is present", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      const button = connectionItem?.shadowRoot?.querySelector("button");
      const chevron = button?.querySelector("ledger-icon[type='chevronRight']");

      expect(chevron).toBeInTheDocument();
    });

    await step("Verify click functionality", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      let clickEventFired = false;

      connectionItem?.addEventListener("connection-item-click", (e: Event) => {
        const customEvent = e as CustomEvent;
        clickEventFired = true;
        expect(customEvent.detail.title).toBe("Test Button");
        expect(customEvent.detail.connectionType).toBe("bluetooth");
      });

      const button = connectionItem?.shadowRoot?.querySelector("button");
      if (button) {
        await userEvent.click(button);
        await waitFor(() => {
          expect(clickEventFired).toBe(true);
        });
      }
    });

    await step("Verify keyboard navigation", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      let keyboardEventFired = false;

      connectionItem?.addEventListener("connection-item-click", () => {
        keyboardEventFired = true;
      });

      const button = connectionItem?.shadowRoot?.querySelector("button");
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
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      const button = connectionItem?.shadowRoot?.querySelector("button");

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("disabled");
    });

    await step("Verify no click events when disabled", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      let clickEventFired = false;

      connectionItem?.addEventListener("connection-item-click", () => {
        clickEventFired = true;
      });

      const button = connectionItem?.shadowRoot?.querySelector("button");
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

export const TestNonClickable: Story = {
  args: {
    title: "Non-clickable Item",
    connectionType: "usb",
    clickable: false,
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify button still renders", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      const button = connectionItem?.shadowRoot?.querySelector("button");

      expect(button).toBeInTheDocument();
    });

    await step("Verify no click events when not clickable", async () => {
      const connectionItem = canvasElement.querySelector(
        "ledger-connection-item",
      );
      let clickEventFired = false;

      connectionItem?.addEventListener("connection-item-click", () => {
        clickEventFired = true;
      });

      const button = connectionItem?.shadowRoot?.querySelector("button");
      if (button) {
        // For non-clickable elements, simulate the click directly instead of using userEvent
        // to test that the component logic prevents the event, not just CSS pointer-events
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(clickEventFired).toBe(false);
      }
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Test story to verify non-clickable state functionality.",
      },
    },
  },
};
