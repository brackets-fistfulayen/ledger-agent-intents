import "./ledger-icon";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Component/Atom/Icon",
  tags: ["autodocs"],
  render: (args) =>
    html`<div>
      <ledger-icon .type=${args.type} .size=${args.size}></ledger-icon>
    </div>`,
  argTypes: {
    type: {
      control: "select",
      options: [
        "ledger",
        "back",
        "close",
        "bluetooth",
        "usb",
        "chevronRight",
        "chevronDown",
        "check",
        "error",
        "device",
        "mobile",
        "desktop",
      ],
      description: "The type of icon to display",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "The size of the icon",
    },
    fillColor: {
      control: "color",
      description: "The color of the icon",
      options: ["white", "black"],
    },
  },
};

export default meta;
type Story = StoryObj;

export const LedgerIconSmall: Story = {
  args: {
    type: "ledger",
    size: "small",
  },
};

export const LedgerIconMedium: Story = {
  args: {
    type: "ledger",
    size: "medium",
  },
};

export const LedgerIconLarge: Story = {
  args: {
    type: "ledger",
    size: "large",
  },
};

export const CloseIconSmall: Story = {
  args: {
    type: "close",
    size: "small",
  },
};

export const CloseIconMedium: Story = {
  args: {
    type: "close",
    size: "medium",
  },
};

export const CloseIconLarge: Story = {
  args: {
    type: "close",
    size: "large",
  },
};

export const BluetoothIconSmall: Story = {
  args: {
    type: "bluetooth",
    size: "small",
  },
};

export const BluetoothIconMedium: Story = {
  args: {
    type: "bluetooth",
    size: "medium",
  },
};

export const BluetoothIconLarge: Story = {
  args: {
    type: "bluetooth",
    size: "large",
  },
};

export const UsbIconSmall: Story = {
  args: {
    type: "usb",
    size: "small",
  },
};

export const UsbIconMedium: Story = {
  args: {
    type: "usb",
    size: "medium",
  },
};

export const UsbIconLarge: Story = {
  args: {
    type: "usb",
    size: "large",
  },
};

export const ChevronRightIconSmall: Story = {
  args: {
    type: "chevronRight",
    size: "small",
  },
};

export const ChevronRightIconMedium: Story = {
  args: {
    type: "chevronRight",
    size: "medium",
  },
};

export const ChevronRightIconLarge: Story = {
  args: {
    type: "chevronRight",
    size: "large",
  },
};

export const ChevronDownIconSmall: Story = {
  args: {
    type: "chevronDown",
    size: "small",
  },
};

export const ChevronDownIconMedium: Story = {
  args: {
    type: "chevronDown",
    size: "medium",
  },
};

export const ChevronDownIconLarge: Story = {
  args: {
    type: "chevronDown",
    size: "large",
  },
};

export const BackIconSmall: Story = {
  args: {
    type: "back",
    size: "small",
  },
};

export const BackIconMedium: Story = {
  args: {
    type: "back",
    size: "medium",
  },
};

export const CheckIconSmall: Story = {
  args: {
    type: "check",
    size: "small",
  },
};

export const CheckIconMedium: Story = {
  args: {
    type: "check",
    size: "medium",
  },
};

export const CheckIconLarge: Story = {
  args: {
    type: "check",
    size: "large",
  },
};

export const ErrorIconSmall: Story = {
  args: {
    type: "error",
    size: "small",
  },
};

export const ErrorIconMedium: Story = {
  args: {
    type: "error",
    size: "medium",
  },
};

export const ErrorIconLarge: Story = {
  args: {
    type: "error",
    size: "large",
  },
};

export const DeviceIconSmall: Story = {
  args: {
    type: "device",
    size: "small",
  },
};

export const DeviceIconMedium: Story = {
  args: {
    type: "device",
    size: "medium",
  },
};

export const DeviceIconLarge: Story = {
  args: {
    type: "device",
    size: "large",
  },
};

export const MobileIconSmall: Story = {
  args: {
    type: "mobile",
    size: "small",
    fillColor: "white",
  },
};
export const MobileIconMedium: Story = {
  args: {
    type: "mobile",
    size: "medium",
    fillColor: "black",
  },
};

export const MobileIconLarge: Story = {
  args: {
    type: "mobile",
    size: "large",
    fillColor: "white",
  },
};

export const AllIcons: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;"
    >
      <div style="text-align: center;">
        <ledger-icon type="ledger" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Ledger</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="close" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Close</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="bluetooth" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Bluetooth</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="usb" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">USB</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="back" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Back</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="chevronRight" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Chevron Right</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="check" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Check</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="error" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Error</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="device" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Device</p>
      </div>
      <div style="text-align: center;">
        <ledger-icon type="platform" size="medium"></ledger-icon>
        <p style="margin: 8px 0 0 0; font-size: 12px;">Platform</p>
      </div>
    </div>
  `,
};
