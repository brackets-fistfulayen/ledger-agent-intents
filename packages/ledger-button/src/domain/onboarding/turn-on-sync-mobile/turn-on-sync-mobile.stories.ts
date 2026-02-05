import "./turn-on-sync-mobile";
import "../../../context/core-context.js";
import "../../../context/language-context.js";
import "../../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Onboarding/TurnOnSyncScreenMobile",
  render: () => html`
    <core-provider>
      <language-provider>
        <turn-on-sync-mobile-screen></turn-on-sync-mobile-screen>
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
        <ledger-modal-story-wrapper>
          <turn-on-sync-mobile-screen></turn-on-sync-mobile-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
