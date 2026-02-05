import "./select-device";
import "../../../context/core-context.js";
import "../../../context/language-context.js";
import "../../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Onboarding/SelectDeviceScreen",
  render: () => html`
    <core-provider>
      <language-provider>
        <select-device-screen></select-device-screen>
      </language-provider>
    </core-provider>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const InContext: Story = {
  render: () => html`
    <core-provider>
      <language-provider>
        <ledger-modal-story-wrapper title="Connect a Ledger">
          <select-device-screen></select-device-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
