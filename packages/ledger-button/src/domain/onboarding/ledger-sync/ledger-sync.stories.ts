import "./ledger-sync";
import "../../../context/core-context.js";
import "../../../context/language-context.js";
import "../../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Onboarding/LedgerSyncScreen",
  render: () => html`
    <core-provider .stubDevice=${true}>
      <language-provider>
        <ledger-sync-screen></ledger-sync-screen>
      </language-provider>
    </core-provider>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const InContext: Story = {
  render: () => html`
    <core-provider .stubDevice=${true}>
      <language-provider>
        <ledger-modal-story-wrapper>
          <ledger-sync-screen></ledger-sync-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
