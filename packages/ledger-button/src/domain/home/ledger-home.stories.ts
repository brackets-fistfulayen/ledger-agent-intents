import "./ledger-home";
import "../../context/core-context.js";
import "../../context/language-context.js";
import "../../components/index.js";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Screens/Home/LedgerHomeScreen",
  render: () => html`
    <core-provider .stub=${true} .stubDevice=${true}>
      <language-provider>
        <ledger-home-screen .demoMode=${true}></ledger-home-screen>
      </language-provider>
    </core-provider>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const InContext: Story = {
  render: () => html`
    <div class="dark">
      <core-provider .stub=${true} .stubDevice=${true}>
        <language-provider>
          <ledger-modal-story-wrapper title="Home">
            <ledger-toolbar
              slot="toolbar"
              title="Val's Stax"
              deviceModelId="stax"
            ></ledger-toolbar>
            <ledger-home-screen .demoMode=${true}></ledger-home-screen>
          </ledger-modal-story-wrapper>
        </language-provider>
      </core-provider>
    </div>
  `,
};
