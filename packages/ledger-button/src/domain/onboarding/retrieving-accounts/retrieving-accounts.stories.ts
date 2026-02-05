import "./retrieving-accounts";
import "../../../context/core-context.js";
import "../../../context/language-context.js";
import "../../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Onboarding/RetrievingAccountsScreen",
  render: () => html`
    <core-provider>
      <language-provider>
        <retrieving-accounts-screen></retrieving-accounts-screen>
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
          <retrieving-accounts-screen></retrieving-accounts-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
