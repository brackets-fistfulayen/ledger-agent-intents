import "./select-account";
import "../../../context/core-context.js";
import "../../../context/language-context.js";
import "../../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Onboarding/SelectAccountScreen",
  render: () => html`
    <core-provider>
      <language-provider>
        <select-account-screen
          .shouldRefreshAccounts=${true}
        ></select-account-screen>
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
        <ledger-modal-story-wrapper title="Choose an account">
          <select-account-screen
            .shouldRefreshAccounts=${true}
          ></select-account-screen>
        </ledger-modal-story-wrapper>
      </language-provider>
    </core-provider>
  `,
};
