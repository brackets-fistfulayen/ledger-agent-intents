import "./device-switch";
import "../../context/core-context.js";
import "../../context/language-context.js";
import "../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/DeviceSwitch/DeviceSwitch",
  render: () => html`
    <core-provider>
      <language-provider>
        <device-switch-screen></device-switch-screen>
      </language-provider>
    </core-provider>
  `,
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
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const InContext: Story = {
  render: () => html`
    <core-provider>
      <language-provider>
        <ledger-modal-story-wrapper title="Your Ledgers">
          <device-switch-screen></device-switch-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
