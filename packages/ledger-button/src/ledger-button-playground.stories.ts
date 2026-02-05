import "./ledger-button-playground";

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Demo/LedgerButtonPlayground",
  render: () => html` <ledger-button-playground></ledger-button-playground> `,
};

export default meta;
type Story = StoryObj;

export const Onboarding: Story = {};
