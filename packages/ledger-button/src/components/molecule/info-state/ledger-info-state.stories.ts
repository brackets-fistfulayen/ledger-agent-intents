import "./ledger-info-state";
import "../../atom/modal/ledger-modal";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect } from "storybook/test";

import type { LedgerModal } from "../../atom/modal/ledger-modal";
import type { LedgerInfoState } from "./ledger-info-state";

const meta: Meta = {
  title: "Component/Molecule/InfoState",
  tags: ["autodocs"],
  render: (args) => html`
    <ledger-info-state
      .device=${args.device || "flex"}
      .title=${args.title || ""}
      .subtitle=${args.subtitle || ""}
    ></ledger-info-state>
  `,
  argTypes: {
    device: {
      control: { type: "select" },
      options: ["flex", "nanox", "stax"],
      description: "The type of Ledger device to display",
      table: {
        type: { summary: "flex | nanox | stax" },
        defaultValue: { summary: "flex" },
      },
    },
    title: {
      control: "text",
      description: "The main title text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    subtitle: {
      control: "text",
      description: "The subtitle text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const LedgerFlex: Story = {
  args: {
    device: "flex",
    title: "Continue on your Ledger Flex",
    subtitle: "Follow instructions appearing on your Ledger's Trusted Display",
  },
  parameters: {
    docs: {
      description: {
        story:
          "InfoState component showing Ledger Flex device with instructions.",
      },
    },
  },
};

export const LedgerNanoX: Story = {
  args: {
    device: "nanox",
    title: "Continue on your Ledger Nano X",
    subtitle: "Follow instructions appearing on your Ledger's Trusted Display",
  },
  parameters: {
    docs: {
      description: {
        story:
          "InfoState component showing Ledger Nano X device with instructions.",
      },
    },
  },
};

export const LedgerStax: Story = {
  args: {
    device: "stax",
    title: "Continue on your Ledger Stax",
    subtitle: "Follow instructions appearing on your Ledger's Trusted Display",
  },
  parameters: {
    docs: {
      description: {
        story:
          "InfoState component showing Ledger Stax device with instructions.",
      },
    },
  },
};

export const WithoutSubtitle: Story = {
  args: {
    device: "flex",
    title: "Connect your Ledger",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoState component with only a title, no subtitle.",
      },
    },
  },
};

export const CustomMessage: Story = {
  args: {
    device: "nanox",
    title: "Transaction Ready",
    subtitle: "Please review and confirm the transaction on your device",
  },
  parameters: {
    docs: {
      description: {
        story: "InfoState component with custom transaction message.",
      },
    },
  },
};

export const AllDevices: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3
          style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: white;"
        >
          Ledger Flex
        </h3>
        <div style="background: #1a1a1a; border-radius: 12px; padding: 16px;">
          <ledger-info-state
            device="flex"
            title="Continue on your Ledger Flex"
            subtitle="Follow instructions appearing on your Ledger's Trusted Display"
          ></ledger-info-state>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: white;"
        >
          Ledger Nano X
        </h3>
        <div style="background: #1a1a1a; border-radius: 12px; padding: 16px;">
          <ledger-info-state
            device="nanox"
            title="Continue on your Ledger Nano X"
            subtitle="Follow instructions appearing on your Ledger's Trusted Display"
          ></ledger-info-state>
        </div>
      </div>

      <div>
        <h3
          style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: white;"
        >
          Ledger Stax
        </h3>
        <div style="background: #1a1a1a; border-radius: 12px; padding: 16px;">
          <ledger-info-state
            device="stax"
            title="Continue on your Ledger Stax"
            subtitle="Follow instructions appearing on your Ledger's Trusted Display"
          ></ledger-info-state>
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Overview of all device types in InfoState components.",
      },
    },
  },
};

export const TestFlexRendering: Story = {
  args: {
    device: "flex",
    title: "Test Flex Device",
    subtitle: "This is a test subtitle for the Flex device",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify InfoState component renders correctly", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      expect(infoState).toBeInTheDocument();
    });

    await step("Verify device icon is present", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const deviceIcon = infoState?.shadowRoot?.querySelector(
        "[data-testid='device-icon']",
      );
      expect(deviceIcon).toBeInTheDocument();

      const svg = deviceIcon?.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    await step("Verify title is displayed", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const title = infoState?.shadowRoot?.querySelector(
        "[data-testid='title']",
      );

      expect(title).toBeInTheDocument();
      expect(title?.textContent?.trim()).toBe("Test Flex Device");
    });

    await step("Verify subtitle is displayed", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const subtitle = infoState?.shadowRoot?.querySelector(
        "[data-testid='subtitle']",
      );

      expect(subtitle).toBeInTheDocument();
      expect(subtitle?.textContent?.trim()).toBe(
        "This is a test subtitle for the Flex device",
      );
    });

    await step("Verify device-specific styling", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const svg = infoState?.shadowRoot?.querySelector("svg");

      expect(svg).toBeInTheDocument();
      // Check SVG has the correct viewBox
      expect(svg?.getAttribute("viewBox")).toBe("0 0 200 220");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify Flex device rendering.",
      },
    },
  },
};

export const TestNanoXRendering: Story = {
  args: {
    device: "nanox",
    title: "Test Nano X Device",
    subtitle: "This is a test subtitle for the Nano X device",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify device type is correctly set", async () => {
      const infoState = canvasElement.querySelector(
        "ledger-info-state",
      ) as LedgerInfoState | null;
      expect(infoState?.device).toBe("nanox");
    });

    await step("Verify title content", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const title = infoState?.shadowRoot?.querySelector(
        "[data-testid='title']",
      );

      expect(title?.textContent?.trim()).toBe("Test Nano X Device");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify Nano X device rendering.",
      },
    },
  },
};

export const TestStaxRendering: Story = {
  args: {
    device: "stax",
    title: "Test Stax Device",
    subtitle: "This is a test subtitle for the Stax device",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify device type is correctly set", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state") as LedgerInfoState | null;
      expect(infoState?.device).toBe("stax");
    });

    await step("Verify title content", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const title = infoState?.shadowRoot?.querySelector(
        "[data-testid='title']",
      );

      expect(title?.textContent?.trim()).toBe("Test Stax Device");
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify Stax device rendering.",
      },
    },
  },
};

export const TestWithoutSubtitle: Story = {
  args: {
    device: "flex",
    title: "Title Only Test",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify title is present", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const title = infoState?.shadowRoot?.querySelector(
        "[data-testid='title']",
      );

      expect(title).toBeInTheDocument();
      expect(title?.textContent?.trim()).toBe("Title Only Test");
    });

    await step("Verify subtitle is not present", async () => {
      const infoState = canvasElement.querySelector("ledger-info-state");
      const subtitle = infoState?.shadowRoot?.querySelector(
        "[data-testid='subtitle']",
      );

      expect(subtitle).not.toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automated test story to verify component without subtitle.",
      },
    },
  },
};

export const InModalIntegration: Story = {
  render: (args) => html`
    <ledger-modal title="Ledger Connect" .isOpen=${true}>
      <ledger-info-state
        device=${args.device ?? "flex"}
        title="Continue on your Ledger Flex"
        subtitle="Follow instructions appearing on your Ledger's Trusted Display"
      ></ledger-info-state>
    </ledger-modal>
  `,
  play: async ({ canvasElement, step }) => {
    await step("Wait for modal to open", async () => {
      const modal = canvasElement.querySelector("ledger-modal") as LedgerModal | null;
      await modal?.openModal();
    });

    await step("Verify modal is open", async () => {
      const modal = canvasElement.querySelector("ledger-modal");
      expect(modal).toBeInTheDocument();
    });

    await step("Verify InfoState is rendered inside modal", async () => {
      const modal = canvasElement.querySelector("ledger-modal");
      const infoState = modal?.querySelector("ledger-info-state");
      expect(infoState).toBeInTheDocument();
    });

    await step("Verify InfoState content", async () => {
      const modal = canvasElement.querySelector("ledger-modal");
      const infoState = modal?.querySelector("ledger-info-state") as LedgerInfoState | null;

      expect(infoState?.device).toBe("flex");
      expect(infoState?.title).toBe("Continue on your Ledger Flex");
      expect(infoState?.subtitle).toBe(
        "Follow instructions appearing on your Ledger's Trusted Display",
      );
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test for InfoState molecule integrated within a modal component - the primary use case for this component",
      },
    },
  },
};
