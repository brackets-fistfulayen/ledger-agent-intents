import "./ledger-device-item";
import "../../atom/modal/ledger-modal-story-wrapper";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Component/Molecule/DeviceItem",
  component: "ledger-device-item",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#000000" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The device name",
    },
    connectionType: {
      control: { type: "select" },
      options: ["bluetooth", "usb", ""],
      description: "The connection type",
    },
    deviceModelId: {
      control: { type: "select" },
      options: ["stax", "flex", "nanos", "nanosp", "nanox"],
      description: "The device model",
    },
    status: {
      control: { type: "select" },
      options: ["connected", "available"],
      description: "The device status",
    },
    clickable: {
      control: "boolean",
      description: "Whether the item is clickable",
    },
    disabled: {
      control: "boolean",
      description: "Whether the item is disabled",
    },
    connectedText: {
      control: "text",
      description: "Text to show when status is connected",
    },
    availableText: {
      control: "text",
      description: "Text to show when status is available",
    },
  },
  args: {
    title: "GM's Flex",
    connectionType: "bluetooth",
    deviceModelId: "flex",
    status: "connected",
    clickable: true,
    disabled: false,
    connectedText: "Connected",
    availableText: "Available",
  },
  decorators: [
    (story) => html`
      <div style="width: 400px; padding: 1rem; background: black;">
        ${story()}
      </div>
    `,
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Connected: Story = {
  args: {
    title: "GM's Flex",
    connectionType: "bluetooth",
    deviceModelId: "flex",
    status: "connected",
    connectedText: "Connected",
    availableText: "Available",
  },
};

export const Available: Story = {
  args: {
    title: "GM's Stax",
    connectionType: "usb",
    deviceModelId: "stax",
    status: "available",
    connectedText: "Connected",
    availableText: "Available",
  },
};

export const NanoX: Story = {
  args: {
    title: "My Nano X",
    connectionType: "bluetooth",
    deviceModelId: "nanox",
    status: "available",
    connectedText: "Connected",
    availableText: "Available",
  },
};

export const NanoS: Story = {
  args: {
    title: "My Nano S",
    connectionType: "usb",
    deviceModelId: "nanos",
    status: "available",
    connectedText: "Connected",
    availableText: "Available",
  },
};

export const AllDevices: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <ledger-device-item
        device-id="device-1"
        title="GM's Flex"
        connection-type="bluetooth"
        device-model-id=${"flex"}
        status="connected"
        connected-text="Connected"
        available-text="Available"
      ></ledger-device-item>
      <ledger-device-item
        device-id="device-2"
        title="GM's Stax"
        connection-type="usb"
        device-model-id=${"stax"}
        status="available"
        connected-text="Connected"
        available-text="Available"
      ></ledger-device-item>
      <ledger-device-item
        device-id="device-3"
        title="My Nano X"
        connection-type="bluetooth"
        device-model-id=${"nanoX"}
        status="available"
        connected-text="Connected"
        available-text="Available"
      ></ledger-device-item>
      <ledger-device-item
        device-id="device-4"
        title="Work Nano S"
        connection-type="usb"
        device-model-id=${"nanoS"}
        status="available"
        connected-text="Connected"
        available-text="Available"
      ></ledger-device-item>
    </div>
  `,
};
