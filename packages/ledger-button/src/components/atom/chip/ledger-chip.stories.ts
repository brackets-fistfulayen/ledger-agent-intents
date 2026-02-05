import "./ledger-chip";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent, waitFor } from "storybook/test";

import LedgerChip from "./ledger-chip";

const meta: Meta = {
  title: "Component/Atom/Chip",
  tags: ["autodocs"],
  render: (args) => html`
    <div class="lb-flex lb-flex-col lb-bg-black lb-p-24">
      <ledger-chip
        .label=${args.label || ""}
        .deviceModelId=${args.deviceModelId || "flex"}
        @ledger-chip-click=${(e: CustomEvent) => {
          console.log("Chip clicked:", e.detail);
        }}
      ></ledger-chip>
    </div>
  `,
  argTypes: {
    label: {
      control: "text",
      description: "The text displayed on the chip",
    },
    deviceModelId: {
      control: "select",
      options: ["flex", "stax", "nanoS", "nanoX", "nanoSP"],
      description: "The device model ID to display the corresponding icon",
    },
  },
};

export default meta;
type Story = StoryObj;

export const ChipWithFlex: Story = {
  args: {
    label: "GM's Flex",
    deviceModelId: "flex",
  },
};

export const ChipWithStax: Story = {
  args: {
    label: "GM's Stax",
    deviceModelId: "stax",
  },
};

export const ChipWithNanoS: Story = {
  args: {
    label: "GM's Nano S",
    deviceModelId: "nanoS",
  },
};

export const ChipWithNanoX: Story = {
  args: {
    label: "GM's Nano X",
    deviceModelId: "nanoX",
  },
};

export const ChipWithNanoSP: Story = {
  args: {
    label: "GM's Nano SP",
    deviceModelId: "nanoSP",
  },
};

export const InteractiveExample: Story = {
  render: () => {
    let selectedDevice = "GM's Flex";
    const devices = [
      "GM's Flex",
      "John's Nano S",
      "Sarah's Nano X",
      "GM's Nano SP",
      "GM's Stax",
      "Dev Device",
    ];

    const handleChipClick = (e: CustomEvent) => {
      const currentIndex = devices.indexOf(selectedDevice);
      const nextIndex = (currentIndex + 1) % devices.length;
      selectedDevice = devices[nextIndex];

      const chipElement = e.target as LedgerChip;
      chipElement.label = selectedDevice;
      chipElement.deviceModelId = selectedDevice.includes("Nano")
        ? "nanoS"
        : selectedDevice.includes("Stax")
          ? "stax"
          : "flex";

      console.log("Device changed to:", selectedDevice);
    };

    return html`
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h3
          style="margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151;"
        >
          Interactive Chip (Click to cycle through devices)
        </h3>
        <ledger-chip
          label=${selectedDevice}
          @ledger-chip-click=${handleChipClick}
        ></ledger-chip>
        <p style="font-size: 12px; color: #6B7280;">
          Click the chip above to see it cycle through different device names.
          In a real implementation, this would open a device selection list in
          the modal.
        </p>
      </div>
    `;
  },
};

export const TestChipInteractions: Story = {
  args: {
    label: "Test Chip",
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify chip renders correctly", async () => {
      const chip = canvasElement.querySelector("ledger-chip");

      expect(chip).toBeInTheDocument();

      const chipContainer = chip?.shadowRoot?.querySelector("button");

      expect(chipContainer).toBeInTheDocument();
    });

    await step("Verify label is displayed", async () => {
      const chip = canvasElement.querySelector("ledger-chip");
      const label = chip?.shadowRoot?.querySelector("span");

      expect(label).toBeInTheDocument();
      expect(label?.textContent?.trim()).toBe("Test Chip");
    });

    await step("Verify icon and chevron are present", async () => {
      const chip = canvasElement.querySelector("ledger-chip");

      const iconElement = chip?.shadowRoot?.querySelector("device-icon");
      console.log(iconElement);
      const chevronElement = chip?.shadowRoot?.querySelector(
        "ledger-icon[type='chevronRight']",
      );

      expect(iconElement).toBeInTheDocument();
      expect(chevronElement).toBeInTheDocument();
    });

    await step("Verify click functionality", async () => {
      const chip = canvasElement.querySelector("ledger-chip");
      let clickEventFired = false;

      chip?.addEventListener("ledger-chip-click", () => {
        clickEventFired = true;
      });

      const chipContainer = chip?.shadowRoot?.querySelector("button");

      if (chipContainer) {
        await userEvent.click(chipContainer as HTMLElement);
        await waitFor(() => {
          expect(clickEventFired).toBe(true);
        });
      }
    });

    await step("Verify accessibility attributes", async () => {
      const chip = canvasElement.querySelector("ledger-chip");
      const chipContainer = chip?.shadowRoot?.querySelector("button");
      expect(chipContainer).toHaveAttribute("aria-label", "Test Chip");

      const iconElement = chip?.shadowRoot?.querySelector("device-icon");
      const chevronElement = chip?.shadowRoot?.querySelector(
        "ledger-icon[type='chevronRight']",
      );

      expect(iconElement).toBeInTheDocument();
      expect(chevronElement).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated test story to verify chip functionality and interactions.",
      },
    },
  },
};
